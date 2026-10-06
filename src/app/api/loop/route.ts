// 【役割】ループ事件（狸小路の隠し事件）の進行を記録する（POST /api/loop）。ホームの HomeMap.tsx から呼ばれる。
//  - { step: "complete" } … 線路を一周なぞった。最初の手がかりを記録し、ループ事件を出現させる
//  - { step: "letter" }   … 届いた手紙を閉じた。手紙を狸小路の手がかりに入れる（一周したあとでないと記録しない）
//
// 返す値：clue（一周で手に入る手がかり）、isNew（初めて一周したか）、letterReceived（手紙をもう受け取っているか）

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { addFoundClue, getFoundClueIds } from "@/lib/progress";
import { findClueById, LETTER_CLUE_ID, LOOP_CLUE_ID } from "@/lib/clues";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const step = body?.step;

  if (step === "complete") {
    const isNew = await addFoundClue(userId, LOOP_CLUE_ID);
    const foundClueIds = await getFoundClueIds(userId);
    return NextResponse.json({
      clue: findClueById(LOOP_CLUE_ID),
      isNew,
      letterReceived: foundClueIds.includes(LETTER_CLUE_ID),
    });
  }

  if (step === "letter") {
    const foundClueIds = await getFoundClueIds(userId);
    if (!foundClueIds.includes(LOOP_CLUE_ID)) {
      return NextResponse.json({ error: "まだ線路を一周していません" }, { status: 400 });
    }
    await addFoundClue(userId, LETTER_CLUE_ID);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
}
