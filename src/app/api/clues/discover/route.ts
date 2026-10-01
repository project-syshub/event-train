import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { findClueByQrText } from "@/lib/clues";
import { mockCases } from "@/lib/cases";
import { addFoundClue } from "@/lib/progress";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const qrText = typeof body?.qrText === "string" ? body.qrText : "";

  const clue = findClueByQrText(qrText);
  if (!clue) {
    return NextResponse.json(
      { error: "このQRコードは手がかりではないようだ…" },
      { status: 404 }
    );
  }

  const isNew = await addFoundClue(userId, clue.id);
  const caseInfo = mockCases.find((c) => c.stationKey === clue.caseId);
  const caseTitle = caseInfo?.title ?? "";
  // 読み取った手がかりの事件ページ（虫眼鏡を閉じたあとに移動する）
  const casePath = caseInfo ? `/case/${caseInfo.id}` : null;

  return NextResponse.json({ clue, caseTitle, casePath, isNew });
}
