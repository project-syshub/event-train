import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // ログイン状態を常に保持: 30日

type SessionRecord = {
  userId: string;
  expiresAt: number;
};

// Next.jsの開発サーバーはモジュールがホットリロードされることがあるため、
// globalThisにMapを持たせてセッションが消えないようにする（本番のマルチプロセス構成ではDB等に置き換える想定）。
const globalForSession = globalThis as unknown as {
  sessionStore?: Map<string, SessionRecord>;
};

const sessionStore = globalForSession.sessionStore ?? new Map<string, SessionRecord>();
globalForSession.sessionStore = sessionStore;

export async function createSession(userId: string): Promise<void> {
  const sessionId = randomUUID();

  sessionStore.set(sessionId, {
    userId,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    sessionStore.delete(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const record = sessionStore.get(sessionId);
  if (!record) return null;

  if (record.expiresAt < Date.now()) {
    sessionStore.delete(sessionId);
    return null;
  }

  return record.userId;
}
