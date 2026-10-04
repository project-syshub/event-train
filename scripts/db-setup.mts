// データベースに users テーブルを作り、最初のアカウント（scripts/data/initial-users.ts）を登録する。
// npm run db:setup で実行する（接続先は .env.local の DATABASE_URL）。
// 何度実行しても大丈夫：テーブルがあれば作り直さず、同じIDのアカウントはパスワードを上書きする。
import { neon } from "@neondatabase/serverless";
import { INITIAL_USERS } from "./data/initial-users.mts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL がありません。先に `npx vercel env pull .env.local` を実行してください。");
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    login_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

for (const user of INITIAL_USERS) {
  await sql`
    INSERT INTO users (id, login_id, password_hash)
    VALUES (${user.id}, ${user.loginId}, ${user.passwordHash})
    ON CONFLICT (id) DO UPDATE SET login_id = EXCLUDED.login_id, password_hash = EXCLUDED.password_hash
  `;
}

const [{ count }] = (await sql`SELECT count(*)::int AS count FROM users`) as { count: number }[];
console.log(`users テーブルに ${count} 件のアカウントがあります`);
