// 【役割】参加者ごとの「どの手がかりを見つけたか」の記録（保存・読み出し・リセット）。
// 記録はサーバーではなく、参加者のブラウザのCookieに改ざんできない形（署名付き）で保存している。
//
// 【変更すると】
//  - FOUND_CLUES_COOKIE_NAME … 名前を変えると、全参加者の発見記録が一斉にリセットされる
//  - FOUND_CLUES_MAX_AGE_SECONDS … 発見記録が残る期間（過ぎると自動で消える）
//  - SESSION_SECRET（環境変数）を変えても、署名が合わなくなって全員の記録が消える
//
// 【注意】ブラウザごとの記録なので、別のスマホやブラウザでログインすると記録は引き継がれない。

import { cookies } from "next/headers";
import { decodeToken, encodeToken } from "./session";

// 名前を変えると以前のCookieを読まなくなり、全員の発見記録がリセットされる
const FOUND_CLUES_COOKIE_NAME = "found_clues_v2";
const FOUND_CLUES_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1年

// 別のユーザーで同じブラウザからログインしたときに記録が混ざらないよう、userIdも署名に含める
type FoundCluesPayload = {
  userId: string;
  clueIds: string[];
};

// TODO: PostgreSQLの発見記録テーブルに置き換える。現時点では署名付きCookieに保存する。
export async function getFoundClueIds(userId: string): Promise<string[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(FOUND_CLUES_COOKIE_NAME)?.value;
  if (!token) return [];

  const payload = decodeToken<FoundCluesPayload>(token);
  if (!payload || payload.userId !== userId || !Array.isArray(payload.clueIds)) return [];

  return payload.clueIds;
}

// Route Handler内でのみ呼び出せる。すべての事件の発見記録を消す（設定メニューのリセット用）
export async function clearFoundClues(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(FOUND_CLUES_COOKIE_NAME);
}

// Route Handler内でのみ呼び出せる（Cookieの書き込みを伴うため）。すでに発見済みならfalseを返す
export async function addFoundClue(userId: string, clueId: string): Promise<boolean> {
  const clueIds = await getFoundClueIds(userId);
  if (clueIds.includes(clueId)) return false;

  const cookieStore = await cookies();
  cookieStore.set(
    FOUND_CLUES_COOKIE_NAME,
    encodeToken<FoundCluesPayload>({ userId, clueIds: [...clueIds, clueId] }),
    {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: FOUND_CLUES_MAX_AGE_SECONDS,
    }
  );
  return true;
}
