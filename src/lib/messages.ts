// 【役割】運営（admin）から参加者全員への一斉メッセージ（送信・予約送信・一覧・未読の取得・既読の記録）。
// messages テーブルにメッセージと届く時刻（visible_at）を、message_reads テーブルに各アカウントが
// どの時刻のメッセージまで読んだか（last_read_at）を保存する。
// テーブルは `npm run db:setup` で作られる。
//
// 【変更すると】
//  - 1通の最大文字数 … message-types.ts の MAX_MESSAGE_LENGTH
//  - 全部のメッセージを消したいとき … Neon の管理画面で `DELETE FROM messages;` を実行する

import { getSql } from "./db";
import type { Message } from "./message-types";

export { MAX_MESSAGE_LENGTH, type Message } from "./message-types";

// visible_at … 参加者に届く時刻（今すぐ送るときは送った時刻、予約したときはその時刻）
type MessageRow = { id: number; body: string; visible_at: string };

function toMessage(row: MessageRow): Message {
  return { id: row.id, body: row.body, createdAt: new Date(row.visible_at).toISOString() };
}

// 全員に送る。visibleAt を指定すると、その時刻になってから届く（予約送信）
export async function sendMessage(body: string, visibleAt?: Date): Promise<Message> {
  const at = (visibleAt ?? new Date()).toISOString();
  const rows = (await getSql()`
    INSERT INTO messages (body, visible_at) VALUES (${body}, ${at}) RETURNING id, body, visible_at
  `) as MessageRow[];
  return toMessage(rows[0]);
}

// 送ったメッセージの一覧（届く時刻の新しい順。予約中のものも含む）
export async function listMessages(): Promise<Message[]> {
  const rows = (await getSql()`
    SELECT id, body, visible_at FROM messages ORDER BY visible_at DESC, id DESC
  `) as MessageRow[];
  return rows.map(toMessage);
}

// まだ読んでいないメッセージ（届く時刻を過ぎたものだけ、古い順）
export async function getUnreadMessages(userId: string): Promise<Message[]> {
  const rows = (await getSql()`
    SELECT m.id, m.body, m.visible_at FROM messages m
    WHERE m.visible_at <= now()
      AND m.visible_at > COALESCE(
        (SELECT last_read_at FROM message_reads WHERE user_id = ${userId}),
        'epoch'::timestamptz
      )
    ORDER BY m.visible_at, m.id
  `) as MessageRow[];
  return rows.map(toMessage);
}

// 届く時刻が upTo 以前のメッセージを既読にする（戻ることはない）
export async function markMessagesRead(userId: string, upTo: Date): Promise<void> {
  const at = upTo.toISOString();
  await getSql()`
    INSERT INTO message_reads (user_id, last_read_id, last_read_at) VALUES (${userId}, 0, ${at})
    ON CONFLICT (user_id) DO UPDATE
      SET last_read_at = GREATEST(COALESCE(message_reads.last_read_at, 'epoch'::timestamptz), EXCLUDED.last_read_at)
  `;
}
