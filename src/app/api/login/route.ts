import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByLoginId } from "@/lib/users";
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
  const passwordMatches = user ? bcrypt.compareSync(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    return NextResponse.json(
      { error: "IDまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
