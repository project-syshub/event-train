"use client";

import { useState, type CSSProperties } from "react";
import { MagnifierIcon } from "@/components/icons";
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

export default function SolveTools() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button style={floatingButtonStyle} onClick={() => setOpen(true)} aria-label="虫眼鏡で調べる">
        <MagnifierIcon size={30} />
      </button>

      {open && <MagnifierOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
