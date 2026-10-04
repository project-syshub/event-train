import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { clearFoundClues } from "@/lib/progress";

// 【役割】設定メニューの「手がかりをリセット」から呼ばれる（POST /api/clues/reset）。
// 押した人のブラウザの発見記録だけを消し、すべての事件の手がかりを未発見に戻す。
//
// 【消すとき】AccountMenu.tsx のボタンと handleResetClues、このファイル、
// progress.ts の clearFoundClues をまとめて削除する。
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  await clearFoundClues();
  return NextResponse.json({ ok: true });
}
