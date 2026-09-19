import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // ログイン状態を常に保持: 30日

// TODO: 本番運用では環境変数(SESSION_SECRET)を必ず設定する。未設定時は開発用の固定値にフォールバックする。
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

type SessionPayload = {
  userId: string;
  exp: number; // 有効期限(UnixTime, 秒)
};

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function encodeToken(payload: SessionPayload): string {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadBase64}.${sign(payloadBase64)}`;
}

function decodeToken(token: string): SessionPayload | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;

  const expected = Buffer.from(sign(payloadBase64));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const token = encodeToken({ userId, exp });

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

  const payload = decodeToken(token);
  if (!payload) return null;

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload.userId;
}
