// アカウントを1件追加する。同じIDがすでにあれば、パスワードを変える。
// npm run db:set-user -- <ID> <パスワード>   （例: npm run db:set-user -- 51 ab12cd）
import { neon } from "@neondatabase/serverless";
import { hashPassword, normalizeLoginId } from "../src/lib/password.ts";

const [rawLoginId, password] = process.argv.slice(2);
if (!rawLoginId || !password) throw new Error("使い方: npm run db:set-user -- <ID> <パスワード>");

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL がありません。先に `npx vercel env pull .env.local` を実行してください。");
const sql = neon(url);

const loginId = normalizeLoginId(rawLoginId);
const rows = (await sql`
  INSERT INTO users (id, login_id, password_hash)
  VALUES (${`participant-${loginId}`}, ${loginId}, ${hashPassword(password)})
  ON CONFLICT (login_id) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id, (xmax = 0) AS inserted
`) as { id: string; inserted: boolean }[];
console.log(rows[0].inserted ? `ID ${loginId} を追加しました` : `ID ${loginId} のパスワードを変更しました`);
