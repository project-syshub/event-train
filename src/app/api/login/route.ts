// 【役割】ログイン画面から送られたIDとパスワードを確認し、正しければログイン状態にする（POST /api/login）。
//
// 【変更すると】
//  - エラー文言 … ログイン画面の赤字のメッセージが変わる
//  - アカウント自体（ID・パスワード）と、入力の揺れの許し方は users.ts で変える

import { NextRequest, NextResponse } from "next/server";
import { findUserByLoginId, verifyPassword } from "@/lib/users";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const loginId = typeof body?.loginId === "string" ? body.loginId : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!loginId || !password) {
    return NextResponse.json(
      { error: "IDとパスワードを入力してください" },
      { status: 400 }
    );
  }

  const user = findUserByLoginId(loginId);
  const passwordMatches = user ? verifyPassword(user, password) : false;

  if (!user || !passwordMatches) {
    return NextResponse.json(
      { error: "IDまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
