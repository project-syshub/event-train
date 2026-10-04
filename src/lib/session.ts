// 【役割】ログイン状態の管理（ログイン時にCookieを発行し、各ページでログイン中か確認する）。
//
// 【変更すると】
//  - SESSION_MAX_AGE_SECONDS … ログインが続く期間。短くすると、その期間ごとにログインし直しが必要になる
//  - SESSION_SECRET（Vercelの環境変数）… 変えると全員がログアウトされ、手がかりの発見記録も消える。
//    本番で未設定だとログインがエラーになる（ローカル開発時は DEV_SESSION_SECRET が使われる）
//  - SESSION_COOKIE_NAME … 変えると全員がログアウトされる

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // ログイン状態を常に保持: 30日

const DEV_SESSION_SECRET = "dev-secret-change-me";

// 本番では環境変数(SESSION_SECRET)を必須とする。開発時のみ固定値にフォールバックする。
// ビルド時に環境変数がなくても失敗しないよう、モジュール読み込み時ではなく署名時に確認する。
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET が設定されていません。本番環境では必ず設定してください。");
  }
  return DEV_SESSION_SECRET;
}

type SessionPayload = {
  userId: string;
  exp: number; // 有効期限(UnixTime, 秒)
};

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

// セッション以外のCookie（手がかりの発見記録など）でも改ざん検知に使う
export function encodeToken<T>(payload: T): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadBase64}.${sign(payloadBase64)}`;
}

export function decodeToken<T>(token: string): T | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expected = Buffer.from(sign(payloadBase64));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8")) as T;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const token = encodeToken<SessionPayload>({ userId, exp });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // 本番(Vercel)はHTTPS配信なのでsecureにする。LAN内の開発サーバー(http)ではsecureにすると
    // Cookieが送信されずログインできなくなるため、開発時のみ無効化する。
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decodeToken<SessionPayload>(token);
  if (!payload) return null;

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload.userId;
}
