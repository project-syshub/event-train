import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { clearFoundClues } from "@/lib/progress";

// 設定メニューの「手がかりをリセット」から呼ばれる。すべての事件の手がかりを未発見に戻す
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  await clearFoundClues();
  return NextResponse.json({ ok: true });
}
