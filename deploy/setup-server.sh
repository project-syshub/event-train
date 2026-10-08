#!/usr/bin/env bash
# 【役割】さくらのVPS（Ubuntu 24.04）に、このアプリを動かす環境を最初に一度だけ用意する。
#   Node.js 24・nginx・certbot（HTTPS証明書）・ファイアウォールの設定、アプリのビルド、
#   常時起動（systemd）と nginx の設定、HTTPS証明書の取得までをまとめて行う。
#
# 【使い方】リポジトリを clone し、.env.production を作ってから、リポジトリの中で実行する
#   sudo bash deploy/setup-server.sh <ドメイン> <メールアドレス>
#   例) sudo bash deploy/setup-server.sh event.example.com you@example.com
# メールアドレスは、HTTPS証明書の期限が近いときなどに Let's Encrypt から連絡が来る宛先。
# 何度実行しても大丈夫（入っているものは入れ直さない）。

set -euo pipefail

DOMAIN="${1:?使い方: sudo bash deploy/setup-server.sh <ドメイン> <メールアドレス>}"
EMAIL="${2:?使い方: sudo bash deploy/setup-server.sh <ドメイン> <メールアドレス>}"

if [ "$(id -u)" -ne 0 ]; then
  echo "sudo を付けて実行してください" >&2
  exit 1
fi

# このスクリプトがあるリポジトリの場所と、アプリを動かすユーザー（sudo を実行した人）
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_USER="${SUDO_USER:?一般ユーザーから sudo で実行してください}"

if [ ! -f "$APP_DIR/.env.production" ]; then
  echo "$APP_DIR/.env.production がありません。手順書（deploy/README.md）の手順4で作ってください" >&2
  exit 1
fi

echo "== メモリが少ないとビルドが失敗するので、スワップ（2GB）がなければ作る"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

echo "== 必要なソフトを入れる（nginx・certbot・Node.js 24）"
apt-get update
apt-get install -y ca-certificates curl git nginx ufw certbot python3-certbot-nginx
if ! node --version 2>/dev/null | grep -q '^v24\.'; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi

echo "== ファイアウォール：SSH・http・https だけを許可する"
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "== アプリをビルドする（QR読み取り用のファイルもここでコピーされる）"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npm ci && npm run build"

echo "== アプリを常時起動にする（systemd）"
sed -e "s#__APP_USER__#$APP_USER#g" -e "s#__APP_DIR__#$APP_DIR#g" \
  "$APP_DIR/deploy/event-train.service" > /etc/systemd/system/event-train.service
systemctl daemon-reload
systemctl enable event-train
systemctl restart event-train

echo "== nginx を設定する"
sed -e "s#__DOMAIN__#$DOMAIN#g" "$APP_DIR/deploy/nginx-event-train.conf" > /etc/nginx/sites-available/event-train
ln -sf /etc/nginx/sites-available/event-train /etc/nginx/sites-enabled/event-train
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "== HTTPS の証明書を取る（ドメインがこのサーバーを向いている必要がある）"
certbot --nginx -d "$DOMAIN" -m "$EMAIL" --agree-tos --non-interactive --redirect

echo ""
echo "完了しました。https://$DOMAIN を開いて確認してください。"
echo "アプリのログ: sudo journalctl -u event-train -f"
