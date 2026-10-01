import { cookies } from "next/headers";
import { decodeToken, encodeToken } from "./session";

const FOUND_CLUES_COOKIE_NAME = "found_clues";
const FOUND_CLUES_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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
