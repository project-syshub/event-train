// 【役割】参加者が、運営から届いた一斉メッセージを受け取る。MessageInbox.tsx から呼ばれる。
//  - GET  /api/messages              … まだ読んでいないメッセージ（古い順）
//  - POST /api/messages { upToId }   … upToId までのメッセージを既読にする
// 運営用アカウント（admin）宛てにはメッセージは届かない（いつも空を返す）。

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { findUserById, isAdmin } from "@/lib/users";
import { getUnreadMessages, markMessagesRead } from "@/lib/messages";

async function getParticipantId(): Promise<string | null | "admin"> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await findUserById(userId);
  if (!user) return null;
  return isAdmin(user) ? "admin" : user.id;
}

export async function GET() {
  const id = await getParticipantId();
  if (!id) return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  if (id === "admin") return NextResponse.json({ messages: [] });
  return NextResponse.json({ messages: await getUnreadMessages(id) });
}

export async function POST(request: NextRequest) {
  const id = await getParticipantId();
  if (!id) return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  if (id === "admin") return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => null);
  const upToId = Number(body?.upToId);
  if (!Number.isInteger(upToId) || upToId <= 0) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }
  await markMessagesRead(id, upToId);
  return NextResponse.json({ ok: true });
}
