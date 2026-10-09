// データベースに users テーブル（アカウント）・found_clues テーブル（手がかりの発見記録）・
// messages / message_reads テーブル（運営からの一斉メッセージと既読の位置）を作り、
// 最初のアカウント（scripts/data/initial-users.mts）を登録する。
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

// 手がかりの発見記録。同じアカウントの同じ手がかりは1回だけ記録する
await sql`
  CREATE TABLE IF NOT EXISTS found_clues (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clue_id TEXT NOT NULL,
    found_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, clue_id)
  )
`;

// 運営（admin）から参加者全員への一斉メッセージ
await sql`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// 各アカウントが、どのメッセージまで読んだか（id がこれ以下のメッセージは既読）
await sql`
  CREATE TABLE IF NOT EXISTS message_reads (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    last_read_id INTEGER NOT NULL
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
