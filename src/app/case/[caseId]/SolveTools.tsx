"use client";

// 【役割】事件ページ右下の虫眼鏡ボタン。押すと虫眼鏡（QR読み取り画面）を開く。
//
// 【変更すると】
//  - right / bottom … ボタンの位置（画面の右下からの距離）
//  - width / height … ボタンの大きさ。中のアイコンの大きさは GoldMagnifierIcon の size

import { useState, type CSSProperties } from "react";
import { GoldMagnifierIcon } from "@/components/icons";
import type { StationKey } from "@/lib/stations";
import MagnifierOverlay from "./MagnifierOverlay";

// 画面右下に浮かせる丸ボタン
const floatingButtonStyle: CSSProperties = {
  position: "fixed",
  right: 18,
  bottom: 18,
  width: 62,
  height: 62,
  padding: 0,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
  zIndex: 50,
};

export default function SolveTools({ caseId }: { caseId: StationKey }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button style={floatingButtonStyle} onClick={() => setOpen(true)} aria-label="虫眼鏡で調べる">
        <GoldMagnifierIcon size={40} />
      </button>

      {open && <MagnifierOverlay caseId={caseId} onClose={() => setOpen(false)} />}
    </>
  );
}
