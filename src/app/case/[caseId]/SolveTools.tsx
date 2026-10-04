"use client";

// 【役割】事件ページ右下の虫眼鏡ボタン。押すと虫眼鏡（QR読み取り画面）を開く。
//
// 【変更すると】
//  - right / bottom … ボタンの位置（画面の右下からの距離）
//  - ICON_SIZE … 虫眼鏡の絵（ボタン）の大きさ
//  - ICON_ROTATE_DEG … 虫眼鏡の絵の傾き（プラスで時計回り）
//  - filter の drop-shadow … 虫眼鏡の絵の影
//  - アイコンの画像 … public/icons/magnifier.png（差し替えるときはファイル名も変える。古い画像が残ることがあるため）

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import type { StationKey } from "@/lib/stations";
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

export default function SolveTools({ caseId }: { caseId: StationKey }) {
  const [open, setOpen] = useState(false);

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
