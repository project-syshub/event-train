// 【役割】ログアウト（POST /api/logout）。ログイン状態のCookieを消す。
// 手がかりの発見記録はアカウントごとにデータベースに残るので、どの端末で再ログインしても続きから遊べる。

import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
