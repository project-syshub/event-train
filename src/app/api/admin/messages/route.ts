// 【役割】運営用アカウント（admin）専用。参加者全員への一斉メッセージを送る・送ったものを一覧する。
//  - GET  /api/admin/messages            … 送ったメッセージの一覧（新しい順）
//  - POST /api/admin/messages { body }   … 全員に送る（admin 自身には届かない）
// 設定メニューの MessageComposer.tsx から呼ばれる。

import { NextRequest, NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/users";
import { listMessages, MAX_MESSAGE_LENGTH, sendMessage } from "@/lib/messages";

const FORBIDDEN = { error: "この操作は運営用アカウントだけが使えます" };

export async function GET() {
  if (!(await getSessionAdmin())) return NextResponse.json(FORBIDDEN, { status: 403 });
  return NextResponse.json({ messages: await listMessages() });
}

export async function POST(request: NextRequest) {
  if (!(await getSessionAdmin())) return NextResponse.json(FORBIDDEN, { status: 403 });

  const body = await request.json().catch(() => null);
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
  }
  if ([...text].length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `メッセージは${MAX_MESSAGE_LENGTH}文字以内にしてください` }, { status: 400 });
  }

  return NextResponse.json({ message: await sendMessage(text) });
}
