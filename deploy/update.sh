#!/usr/bin/env bash
# 【役割】GitHub の最新のコードを VPS に反映する（取り込み → ビルド → 再起動）。
# 【使い方】VPS にログインし、リポジトリの中で実行する
#   bash deploy/update.sh
# ビルドが終わるまでは今の版が動き続け、最後の再起動の数秒だけ止まる。

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

git pull --ff-only
npm ci
npm run build
sudo systemctl restart event-train

echo "反映しました（$(git log -1 --format='%h %s')）"
