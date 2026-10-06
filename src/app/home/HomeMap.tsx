"use client";

// 【役割】ホームの路線図と、ループ事件（線路を一周なぞる隠し要素）の演出をまとめる。
//  1. 線路を一周なぞる（TramMap.tsx）→ /api/loop で記録し、狸小路に「ループ事件」が現れる
//  2. 手に入れた手がかりをポップアップで表示する（ClueDetailPopup.tsx）
//  3. ポップアップを閉じると、報酬係から手紙が届く（LetterOverlay.tsx）
//  4. 手紙を閉じると、手紙が狸小路の手がかりに入る
// 2回目以降に一周したときは、手がかりのポップアップだけを出す（手紙はもう受け取っているため）。
// 反時計回りに一周したときは、事件は出さずに「違うよ」と短く表示する。
//
// 【変更すると】
//  - 手がかりのポップアップの上に出る一言 … loopHeading の文言
//  - 反時計回りのときの文言 … WRONG_DIRECTION_TITLE / WRONG_DIRECTION_TEXT
//  - WRONG_DIRECTION_MS … 「違うよ」を表示しておく時間（タップしても消える）
//  - 初めて現れたときの紙吹雪 … Confetti.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClueItem } from "@/lib/clues";
import ClueDetailPopup from "@/app/case/[caseId]/ClueDetailPopup";
import TramMap, { type MapMarker } from "./TramMap";
import LetterOverlay from "./LetterOverlay";
import Confetti from "./Confetti";

const WRONG_DIRECTION_TITLE = "違うよ…！";
const WRONG_DIRECTION_TEXT = "なにかが違うみたい";
const WRONG_DIRECTION_MS = 2200;

type LoopStage =
  | { kind: "idle" }
  | { kind: "wrong" }
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

  // 「違うよ」は少し表示したら自動で消す
  useEffect(() => {
    if (stage.kind !== "wrong") return;
    const timer = setTimeout(() => setStage({ kind: "idle" }), WRONG_DIRECTION_MS);
    return () => clearTimeout(timer);
  }, [stage.kind]);

  function handleWrongDirection() {
    if (stage.kind === "idle") setStage({ kind: "wrong" });
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
      <TramMap markers={markers} onLoopComplete={handleLoopComplete} onWrongDirection={handleWrongDirection} />

      {stage.kind === "wrong" && (
        <div
          onClick={() => setStage({ kind: "idle" })}
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="letter-pop"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              borderRadius: 12,
              padding: "20px 32px",
              textAlign: "center",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            <p style={{ fontSize: 26, fontWeight: 900 }}>{WRONG_DIRECTION_TITLE}</p>
            <p style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>{WRONG_DIRECTION_TEXT}</p>
          </div>
        </div>
      )}

      {stage.kind === "clue" && (
        <ClueDetailPopup clue={stage.clue} heading={loopHeading(stage.isNew)} onClose={handleClueClose} />
      )}
      {/* 初めてループ事件が現れたときは、手がかりのポップアップと一緒に紙吹雪を降らせる */}
      {stage.kind === "clue" && stage.isNew && <Confetti />}
      {stage.kind === "letter" && <LetterOverlay onClose={handleLetterClose} />}
    </>
  );
}
