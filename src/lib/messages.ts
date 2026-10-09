// 【役割】運営（admin）から参加者全員への一斉メッセージ（送信・一覧・未読の取得・既読の記録）。
// messages テーブルにメッセージを、message_reads テーブルに各アカウントがどこまで読んだかを保存する。
// テーブルは `npm run db:setup` で作られる。
//
// 【変更すると】
//  - 1通の最大文字数 … message-types.ts の MAX_MESSAGE_LENGTH
//  - 全部のメッセージを消したいとき … Neon の管理画面で `DELETE FROM messages;` を実行する

import { getSql } from "./db";
import type { Message } from "./message-types";

export { MAX_MESSAGE_LENGTH, type Message } from "./message-types";

type MessageRow = { id: number; body: string; created_at: string };

function toMessage(row: MessageRow): Message {
  return { id: row.id, body: row.body, createdAt: new Date(row.created_at).toISOString() };
}

export async function sendMessage(body: string): Promise<Message> {
  const rows = (await getSql()`
    INSERT INTO messages (body) VALUES (${body}) RETURNING id, body, created_at
  `) as MessageRow[];
  return toMessage(rows[0]);
}

// 送ったメッセージの一覧（新しい順）
export async function listMessages(): Promise<Message[]> {
  const rows = (await getSql()`SELECT id, body, created_at FROM messages ORDER BY id DESC`) as MessageRow[];
  return rows.map(toMessage);
}

// まだ読んでいないメッセージ（古い順）
export async function getUnreadMessages(userId: string): Promise<Message[]> {
  const rows = (await getSql()`
    SELECT m.id, m.body, m.created_at FROM messages m
    WHERE m.id > COALESCE((SELECT last_read_id FROM message_reads WHERE user_id = ${userId}), 0)
    ORDER BY m.id
  `) as MessageRow[];
  return rows.map(toMessage);
}

// id が upToId 以下のメッセージを既読にする（戻ることはない）
export async function markMessagesRead(userId: string, upToId: number): Promise<void> {
  await getSql()`
    INSERT INTO message_reads (user_id, last_read_id) VALUES (${userId}, ${upToId})
    ON CONFLICT (user_id) DO UPDATE SET last_read_id = GREATEST(message_reads.last_read_id, EXCLUDED.last_read_id)
  `;
}
