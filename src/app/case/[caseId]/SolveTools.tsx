"use client";

import { useState, type CSSProperties } from "react";
import { MagnifierIcon } from "@/components/icons";
import MagnifierOverlay from "./MagnifierOverlay";

const barStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  padding: "10px 0",
  background: "var(--color-surface)",
  borderTop: "1px solid var(--color-border)",
  zIndex: 50,
};

const toolButtonStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  padding: "6px 16px",
  border: "none",
  background: "none",
  boxShadow: "none",
  color: "var(--color-text)",
  cursor: "pointer",
};

export default function SolveTools() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={barStyle}>
        <button style={toolButtonStyle} onClick={() => setOpen(true)}>
          <MagnifierIcon />
          <span style={{ fontSize: 14 }}>虫眼鏡</span>
        </button>
      </nav>

      {open && <MagnifierOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
