// 【役割】テスト用。設定メニューの「○○の手がかりを全部出す」から呼ばれる（POST /api/clues/grant）。
// 指定した事件の手がかりを、押した人のアカウントですべて見つけた状態にする。
// 狸小路（隠し事件）の場合は、線路を一周した記録と手紙も入るので、事件も現れる。
//
// 【消すとき】AccountMenu.tsx のボタンと handleGrantClues、このファイルをまとめて削除する。

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { addFoundClue } from "@/lib/progress";
import { mockClues } from "@/lib/clues";
import { mockCases } from "@/lib/cases";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

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
