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
  const caseTitle = mockCases.find((c) => c.stationKey === clue.caseId)?.title ?? "";

  return NextResponse.json({ clue, caseTitle, isNew });
}
