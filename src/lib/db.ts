// 【役割】データベース（Neon の PostgreSQL）への接続。
//
// 接続先は環境変数 DATABASE_URL で決まる。Vercel では Neon の連携を追加したときに自動で設定され、
// ローカルでは `npx vercel env pull .env.local` で .env.local に取り込む。
// テーブルの作成と初期データの登録は `npm run db:setup` で行う（scripts/db-setup.mts）。

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, false> | null = null;

// ビルド時など環境変数がない場面で失敗しないよう、最初に使うときに接続を用意する
export function getSql(): NeonQueryFunction<false, false> {
  if (sql) return sql;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL が設定されていません。データベースの接続先を環境変数に設定してください。");
  }
  sql = neon(url);
  return sql;
}
