"use client";

// 【役割】ホームの路線図と、ループ事件（線路を一周なぞる隠し要素）の演出をまとめる。
//  1. 線路を一周なぞる（TramMap.tsx）→ /api/loop で記録し、狸小路に「ループ事件」が現れる
//  2. 手に入れた手がかりをポップアップで表示する（ClueDetailPopup.tsx）
//  3. ポップアップを閉じると、依頼主から手紙が届く（LetterOverlay.tsx）
//  4. 手紙を閉じると、手紙が狸小路の手がかりに入る
// 2回目以降に一周したときは、手がかりのポップアップだけを出す（手紙はもう受け取っているため）。
//
// 【変更すると】
//  - 手がかりのポップアップの上に出る一言 … loopHeading の文言

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClueItem } from "@/lib/clues";
import ClueDetailPopup from "@/app/case/[caseId]/ClueDetailPopup";
import TramMap, { type MapMarker } from "./TramMap";
import LetterOverlay from "./LetterOverlay";

type LoopStage =
  | { kind: "idle" }
  | { kind: "clue"; clue: ClueItem; isNew: boolean; letterReceived: boolean }
  | { kind: "letter" };

function loopHeading(isNew: boolean): string {
  return isNew ? "狸小路に「ループ事件」が現れた！\n手がかりを発見！" : "この手がかりはもう見つけている";
}

export default function HomeMap({ markers }: { markers: MapMarker[] }) {
  const router = useRouter();
  const [stage, setStage] = useState<LoopStage>({ kind: "idle" });

  async function handleLoopComplete() {
    if (stage.kind !== "idle") return;

    const response = await fetch("/api/loop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "complete" }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);
    if (!response?.ok || !data?.clue) return;

    // 路線図に狸小路の事件（虫眼鏡のマーカー）を出す
    router.refresh();
    setStage({ kind: "clue", clue: data.clue, isNew: data.isNew, letterReceived: data.letterReceived });
  }

  function handleClueClose() {
    if (stage.kind === "clue" && !stage.letterReceived) {
      setStage({ kind: "letter" });
    } else {
      setStage({ kind: "idle" });
    }
  }

  async function handleLetterClose() {
    setStage({ kind: "idle" });
    await fetch("/api/loop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "letter" }),
    }).catch(() => null);
    router.refresh();
  }

  return (
    <>
      <TramMap markers={markers} onLoopComplete={handleLoopComplete} />

      {stage.kind === "clue" && (
        <ClueDetailPopup clue={stage.clue} heading={loopHeading(stage.isNew)} onClose={handleClueClose} />
      )}
      {stage.kind === "letter" && <LetterOverlay onClose={handleLetterClose} />}
    </>
  );
}
