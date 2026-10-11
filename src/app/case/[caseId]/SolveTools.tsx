"use client";

// 【役割】事件ページ右下の虫眼鏡ボタン。押すと虫眼鏡（QR読み取り画面）を開く。
// イベント終了後（lib/event.ts）は、参加者には灰色の虫眼鏡と「終了しました」を出し、押せなくする。
//
// 【変更すると】
//  - right / bottom … ボタンの位置（画面の右下からの距離）
//  - ICON_SIZE … 虫眼鏡の絵（ボタン）の大きさ
//  - ICON_ROTATE_DEG … 虫眼鏡の絵の傾き（プラスで時計回り）
//  - filter の drop-shadow … 虫眼鏡の絵の影
//  - アイコンの画像 … public/icons/magnifier.png（差し替えるときはファイル名も変える。古い画像が残ることがあるため）

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { StationKey } from "@/lib/stations";
import { EVENT_END_AT, isEventOver } from "@/lib/event";
import MagnifierOverlay from "./MagnifierOverlay";

const ICON_SIZE = 68;
// 虫眼鏡の絵の傾き（度。プラスで時計回り）
const ICON_ROTATE_DEG = 5;

// 画面右下に浮かせるボタン。背景（赤い丸）は付けず、虫眼鏡の絵だけを表示する
const floatingButtonStyle: CSSProperties = {
  position: "fixed",
  right: 14,
  bottom: 14,
  width: ICON_SIZE,
  height: ICON_SIZE,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  boxShadow: "none",
  // 背景のオレンジに埋もれないよう、絵の形に沿った影を付ける
  filter: "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45))",
  zIndex: 50,
};

// イベント終了（lib/event.ts の EVENT_END_AT）を過ぎたら、参加者は虫眼鏡を使えなくする（admin は使える）
export default function SolveTools({ caseId, isAdmin = false }: { caseId: StationKey; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const [ended, setEnded] = useState(() => !isAdmin && isEventOver());

  // 画面を開いたまま終了時刻になったら、虫眼鏡を閉じて使えなくする
  useEffect(() => {
    if (isAdmin || ended) return;
    const timer = setTimeout(() => {
      setEnded(true);
      setOpen(false);
    }, Math.max(0, EVENT_END_AT.getTime() - Date.now()));
    return () => clearTimeout(timer);
  }, [isAdmin, ended]);

  if (ended) {
    return (
      <div
        style={{ ...floatingButtonStyle, width: "auto", filter: "none", flexDirection: "column", gap: 2, opacity: 0.85 }}
        aria-label="イベントは終了しました"
      >
        <Image
          src="/icons/magnifier.png"
          alt=""
          width={ICON_SIZE}
          height={ICON_SIZE}
          style={{ transform: `rotate(${ICON_ROTATE_DEG}deg)`, filter: "grayscale(1)", opacity: 0.5 }}
        />
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)" }}>終了しました</span>
      </div>
    );
  }

  return (
    <>
      <button style={floatingButtonStyle} onClick={() => setOpen(true)} aria-label="虫眼鏡で調べる">
        <Image
          src="/icons/magnifier.png"
          alt=""
          width={ICON_SIZE}
          height={ICON_SIZE}
          preload
          style={{ transform: `rotate(${ICON_ROTATE_DEG}deg)` }}
        />
      </button>

      {open && <MagnifierOverlay caseId={caseId} onClose={() => setOpen(false)} />}
    </>
  );
}
