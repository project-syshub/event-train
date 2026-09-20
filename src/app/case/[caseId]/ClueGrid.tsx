"use client";

import { useState, type CSSProperties } from "react";
import type { ClueItem, ClueSlot } from "@/lib/clues";
import { CloseIcon, PuzzleIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";

const cardStyle: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  padding: 10,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  color: "var(--color-text)",
  textAlign: "center",
};

// 写真プリント風の白い枠。写真とタイトルをまとめて囲む
const printStyle: CSSProperties = {
  background: "#ffffff",
  padding: 5,
  borderRadius: 2,
};

const photoStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1",
  background: "var(--color-surface-alt)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text)",
};

const captionStyle: CSSProperties = {
  color: "var(--color-accent)",
  fontWeight: 700,
  fontSize: 14,
  lineHeight: 1.3,
  padding: "6px 2px 2px",
};

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
              <div style={printStyle}>
                <div style={photoStyle}>
                  <PuzzleIcon size={40} />
                </div>
                <p style={captionStyle}>{slot.clue.name}</p>
              </div>
            </button>
          ) : (
            <div
              key={`unknown-${index}`}
              style={{
                ...cardStyle,
                minHeight: 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 38,
                fontWeight: 700,
              }}
            >
              ？
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
            <div style={printStyle}>
              <div style={photoStyle}>
                <PuzzleIcon size={64} />
              </div>
              <p style={{ ...captionStyle, fontSize: 16 }}>{selected.name}</p>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>{selected.description}</p>
          </div>
        </div>
      )}
    </>
  );
}
