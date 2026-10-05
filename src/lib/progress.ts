// 【役割】アカウントごとの「どの手がかりを見つけたか」の記録（保存・読み出し・リセット）。
// 記録はデータベースの found_clues テーブルに保存する。同じアカウントなら、別のスマホやブラウザで
// ログインしても同じ記録が見える（グループで1つのアカウントを使い、手分けして探すこともできる）。
//
// found_clues テーブル：user_id（users.id）/ clue_id（clues.ts の id）/ found_at（見つけた日時）
// テーブルは `npm run db:setup` で作られる（scripts/db-setup.mts）。
//
// 【変更すると】
//  - clues.ts の手がかりの id を変える … その手がかりを見つけた記録が引き継がれなくなる
//  - 全員の記録を消したいとき … Neon の管理画面で `DELETE FROM found_clues;` を実行する

import { getSql } from "./db";

export async function getFoundClueIds(userId: string): Promise<string[]> {
  const rows = (await getSql()`
    SELECT clue_id FROM found_clues WHERE user_id = ${userId} ORDER BY found_at
  `) as { clue_id: string }[];
  return rows.map((row) => row.clue_id);
}

// そのアカウントの、すべての事件の発見記録を消す（設定メニューの「手がかりをリセット」用）
export async function clearFoundClues(userId: string): Promise<void> {
  await getSql()`DELETE FROM found_clues WHERE user_id = ${userId}`;
}

// 発見記録に追加する。すでに見つけていた手がかりなら false を返す
export async function addFoundClue(userId: string, clueId: string): Promise<boolean> {
  const rows = await getSql()`
    INSERT INTO found_clues (user_id, clue_id) VALUES (${userId}, ${clueId})
    ON CONFLICT (user_id, clue_id) DO NOTHING
    RETURNING clue_id
  `;
  return rows.length > 0;
}
