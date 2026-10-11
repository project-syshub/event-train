// イベント終了前後の一斉メッセージを、決めた時刻に届くよう予約する（npm run messages:schedule-end）。
// 同じ内容がすでに予約されていれば、二重には入れない。何度実行しても大丈夫。
// 時刻と文面を変えるときは、下の SCHEDULE を書き換えてから実行する。
import { neon } from "@neondatabase/serverless";

const SCHEDULE = [
  { at: "2026-10-11T15:50:00+09:00", body: "終了まで残り10分です！" },
  { at: "2026-10-11T16:00:00+09:00", body: "終了！" },
];

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL がありません。先に `npx vercel env pull .env.local` を実行してください。");
const sql = neon(url);

for (const { at, body } of SCHEDULE) {
  const visibleAt = new Date(at).toISOString();
  const existing = await sql`SELECT id FROM messages WHERE body = ${body} AND visible_at = ${visibleAt}`;
  if (existing.length > 0) {
    console.log(`予約済み: ${at}「${body}」`);
    continue;
  }
  await sql`INSERT INTO messages (body, visible_at) VALUES (${body}, ${visibleAt})`;
  console.log(`予約しました: ${at}「${body}」`);
}
