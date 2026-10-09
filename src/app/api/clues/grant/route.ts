// 【役割】運営用アカウント（admin）専用。テスト用。設定メニューの「○○の手がかりを全部出す」から呼ばれる（POST /api/clues/grant）。
// 指定した事件の手がかりを、押した人のアカウントですべて見つけた状態にする。
// 狸小路（隠し事件）の場合は、線路を一周した記録と手紙も入るので、事件も現れる。
//
// 【消すとき】AccountMenu.tsx のボタンと handleGrantClues、このファイルをまとめて削除する。

import { NextRequest, NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/users";
import { addFoundClue } from "@/lib/progress";
import { mockClues } from "@/lib/clues";
import { mockCases } from "@/lib/cases";

export async function POST(request: NextRequest) {
  // 運営用アカウント（admin）だけが使える
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "この操作は運営用アカウントだけが使えます" }, { status: 403 });
  }
  const userId = admin.id;

  const body = await request.json().catch(() => null);
  const caseInfo = mockCases.find((c) => c.id === body?.caseId);
  if (!caseInfo) {
    return NextResponse.json({ error: "事件が見つかりません" }, { status: 400 });
  }

  const clueIds = mockClues.filter((clue) => clue.caseId === caseInfo.stationKey).map((clue) => clue.id);
  for (const clueId of clueIds) {
    await addFoundClue(userId, clueId);
  }

  return NextResponse.json({ ok: true, count: clueIds.length });
}
