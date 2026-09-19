"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import MagnifierOverlay from "./MagnifierOverlay";

type Tool = "magnifier" | null;

const barStyle: CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-around",
  padding: "10px 0",
  background: "var(--color-surface)",
  borderTop: "1px solid var(--color-border)",
  zIndex: 50,
};

const toolButtonStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  border: "none",
  background: "none",
  color: "var(--color-text)",
  cursor: "pointer",
};

export default function SolveTools({ caseId }: { caseId: string }) {
  const [active, setActive] = useState<Tool>(null);

  return (
    <>
      <nav style={barStyle}>
        <button style={toolButtonStyle} onClick={() => setActive("magnifier")}>
          <span style={{ fontSize: 30 }}>🔍</span>
          <span style={{ fontSize: 14 }}>虫眼鏡</span>
        </button>
        <Link href={`/case/${caseId}/clues`} style={{ ...toolButtonStyle, textDecoration: "none" }}>
          <span style={{ fontSize: 30 }}>🧩</span>
          <span style={{ fontSize: 14 }}>手がかり</span>
        </Link>
      </nav>

      {active === "magnifier" && <MagnifierOverlay onClose={() => setActive(null)} />}
    </>
  );
}
