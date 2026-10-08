# さくらのVPSで動かす手順

Vercel で動いているアプリを、そのまま（コードの変更なしで）さくらのVPSで動かすための手順です。
データベースは今の Neon をそのまま使います。

## 全体の流れ

1. さくらのVPSを用意する（コントロールパネル）
2. ドメインをVPSに向ける
3. VPSにログインして、リポジトリを取得する
4. 設定ファイル `.env.production` を作る
5. `setup-server.sh` を実行する（ここで全部そろう）
6. 動作を確認する
7. Vercel を止める（任意）

---

## 1. さくらのVPSを用意する

コントロールパネルで次のように設定します。

| 項目 | 設定 |
|---|---|
| プラン | メモリ 2GB 以上がおすすめ（1GB でも動くが、ビルドに時間がかかる） |
| OS | **Ubuntu 24.04** |
| 管理ユーザー | `ubuntu`（初期設定のまま） |
| SSHキー | 手元のPCの公開鍵を登録する（パスワードより安全） |
| パケットフィルタ | **22（SSH）・80（http）・443（https）** を許可する |

パケットフィルタで 80・443 を開けていないと、ブラウザから開けず、HTTPS の証明書も取れません。

## 2. ドメインをVPSに向ける

ドメインの管理画面（さくらのドメインなど）で、使いたいドメイン（例：`event.example.com`）の
**Aレコード** に、VPS の IPアドレス（コントロールパネルに表示）を登録します。

反映まで数分〜数時間かかることがあります。手元のPCで次を実行し、VPS の IPアドレスが出れば反映済みです。

```bash
dig +short event.example.com
```

## 3. VPSにログインして、リポジトリを取得する

```bash
ssh ubuntu@<VPSのIPアドレス>

sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/project-syshub/event-train.git
cd event-train
```

## 4. 設定ファイル `.env.production` を作る

リポジトリの中（`~/event-train`）に `.env.production` を作ります。
このファイルには秘密の値が入るので、GitHub には上げません（`.gitignore` で除外済み）。

```bash
nano .env.production
```

中身は次の2行です。

```
SESSION_SECRET=ここに鍵
DATABASE_URL=ここにデータベースの接続先
```

- **SESSION_SECRET**：ログイン状態を守るための鍵です。VPS上で次を実行して出てきた文字列を貼り付けます。
  ```bash
  openssl rand -base64 32
  ```
  Vercel とは別の鍵になるので、移行すると参加者は一度ログインし直しになります（手がかりの記録は消えません）。
- **DATABASE_URL**：Neon の接続先です。手元のPCのリポジトリにある `.env.local` の
  `DATABASE_URL=` の行をそのままコピーします。
  （`.env.local` がない場合は、手元のPCで `npx vercel env pull .env.local` を実行すると作られます）

保存したら、ほかの人が読めないようにします。

```bash
chmod 600 .env.production
```

## 5. `setup-server.sh` を実行する

```bash
sudo bash deploy/setup-server.sh event.example.com あなたのメールアドレス
```

これ1つで、次のことをまとめて行います（10分ほどかかります）。

- メモリ不足でビルドが失敗しないよう、スワップを用意する
- Node.js 24・nginx・certbot（HTTPS証明書）を入れる
- ファイアウォールで SSH・http・https だけを許可する
- アプリをビルドする
- アプリを常に動かしておく設定（systemd）をする
- nginx で `https://ドメイン` をアプリにつなぐ
- Let's Encrypt の HTTPS 証明書を取る（自動で更新される）

最後に「完了しました」と出れば成功です。

## 6. 動作を確認する

スマホで `https://ドメイン` を開いて、次を確認します。

- ログインできる（ID `1`〜`50`、`admin`）
- 路線図・事件ページ・手がかりの画像が表示される
- 虫眼鏡でカメラが起動し、QRを読める（**HTTPS でないとカメラは起動しません**）
- 線路を一周なぞるとループ事件が出る

うまく動かないときは、アプリのログを見ます。

```bash
sudo journalctl -u event-train -f
```

## 7. Vercel を止める（任意）

VPS で問題なく動いたら、Vercel のプロジェクトを止めます（Vercel のダッシュボードで削除、
または GitHub との連携を外す）。止めるまでは、GitHub にプッシュすると Vercel にも反映され続けます。
Neon のデータベースは Vercel の連携で作ったものなので、**Vercel のプロジェクトを削除するときは、
データベースまで消えないよう注意**してください（Storage タブから切り離しだけにする）。

---

## 更新のしかた（2回目以降）

GitHub にプッシュしたあと、VPS で次を実行すると反映されます。

```bash
ssh ubuntu@<VPSのIPアドレス>
cd event-train
bash deploy/update.sh
```

ビルドの間は今の版が動き続け、最後の再起動の数秒だけ止まります。

## よく使う操作

| やりたいこと | コマンド |
|---|---|
| アプリが動いているか確認 | `sudo systemctl status event-train` |
| アプリを再起動 | `sudo systemctl restart event-train` |
| アプリのログを見る | `sudo journalctl -u event-train -f` |
| nginx の設定を確認・反映 | `sudo nginx -t && sudo systemctl reload nginx` |
| HTTPS 証明書の更新を試す | `sudo certbot renew --dry-run` |

## ファイルの役割

| ファイル | 役割 |
|---|---|
| `deploy/setup-server.sh` | 最初に一度だけ実行する、サーバーの準備一式 |
| `deploy/update.sh` | 最新のコードを反映する |
| `deploy/event-train.service` | アプリを常に動かしておく設定（systemd） |
| `deploy/nginx-event-train.conf` | `https://ドメイン` をアプリにつなぐ設定（nginx） |
