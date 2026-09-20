"use client";

import { useState, type CSSProperties } from "react";
import type { ClueItem, ClueSlot } from "@/lib/clues";
import { CloseIcon, PuzzleIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";

const CAPTION_FONT_SIZE = 14;
const CAPTION_LINE_HEIGHT = 1.3;
// タイトルが1行でも2行でもカードの高さが変わらないよう、2行ぶんで固定する
const CAPTION_HEIGHT = Math.round(CAPTION_FONT_SIZE * CAPTION_LINE_HEIGHT * 2) + 8;

const cardStyle: CSSProperties = {
  position: "relative",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  padding: 10,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  color: "var(--color-text)",
  textAlign: "center",
};

const photoStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text)",
};

const captionStyle: CSSProperties = {
  color: "var(--color-accent)",
  fontWeight: 700,
  fontSize: CAPTION_FONT_SIZE,
  lineHeight: CAPTION_LINE_HEIGHT,
  padding: "6px 2px 2px",
  height: CAPTION_HEIGHT,
  overflow: "hidden",
};

// 未発見の枠も同じ構造で描画することで、写真入りのカードと高さを揃える
function ClueCardBody({ clue }: { clue: ClueItem | null }) {
  const found = clue !== null;

  return (
    <>
      <div
        style={{
          background: found ? "#ffffff" : "transparent",
          padding: 5,
          borderRadius: 2,
        }}
      >
        <div
          style={{
            ...photoStyle,
            background: found ? "var(--color-surface-alt)" : "transparent",
          }}
        >
          {found && <PuzzleIcon size={40} />}
        </div>
        <p style={{ ...captionStyle, visibility: found ? "visible" : "hidden" }}>
          {found ? clue.name : " "}
        </p>
      </div>

      {!found && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            fontWeight: 700,
          }}
        >
          ？
        </div>
      )}
    </>
  );
}

export default function ClueGrid({ slots }: { slots: ClueSlot[] }) {
  const [selected, setSelected] = useState<ClueItem | null>(null);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {slots.map((slot, index) =>
          slot.found ? (
            <button
              key={slot.clue.id}
              onClick={() => setSelected(slot.clue)}
              style={cardStyle}
              aria-label={`${slot.clue.name}の詳細を見る`}
            >
              <ClueCardBody clue={slot.clue} />
            </button>
          ) : (
            <div key={`unknown-${index}`} style={cardStyle}>
              <ClueCardBody clue={null} />
            </div>
          )
        )}
      </div>

      {selected && (
        <div style={overlayStyle}>
          <button
            className="icon-button"
            onClick={() => setSelected(null)}
            style={closeButtonStyle}
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>

          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: 20,
              width: "100%",
              maxWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ background: "#ffffff", padding: 5, borderRadius: 2 }}>
              <div style={{ ...photoStyle, background: "var(--color-surface-alt)" }}>
                <PuzzleIcon size={64} />
              </div>
              <p
                style={{
                  color: "var(--color-accent)",
                  fontWeight: 700,
                  fontSize: 16,
                  lineHeight: 1.3,
                  padding: "8px 2px 2px",
                  textAlign: "center",
                }}
              >
                {selected.name}
              </p>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>{selected.description}</p>
          </div>
        </div>
      )}
    </>
  );
}
