import { NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/users";
import { clearFoundClues } from "@/lib/progress";

// 【役割】運営用アカウント（admin）専用。設定メニューの「手がかりをリセット」から呼ばれる（POST /api/clues/reset）。
// 押した人のアカウントの発見記録を消し、すべての事件の手がかりを未発見に戻す
// （同じアカウントでログインしている別のスマホでも未発見に戻る）。
//
// 【消すとき】AccountMenu.tsx のボタンと handleResetClues、このファイル、
// progress.ts の clearFoundClues をまとめて削除する。
export async function POST() {
  // 運営用アカウント（admin）だけが使える
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "この操作は運営用アカウントだけが使えます" }, { status: 403 });
  }
  const userId = admin.id;

  await clearFoundClues(userId);
  return NextResponse.json({ ok: true });
}
