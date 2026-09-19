"use client";

import type { ClueItem } from "@/lib/clues";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";

export default function CluesOverlay({
  items,
  onClose,
}: {
  items: ClueItem[];
  onClose: () => void;
}) {
  return (
    <div style={overlayStyle}>
      <button onClick={onClose} style={closeButtonStyle} aria-label="閉じる">
        ×
      </button>

      <h2 style={{ color: "white", margin: 0 }}>🧩 手がかり</h2>

      <div style={{ width: "100%", maxWidth: 320, maxHeight: "60vh", overflowY: "auto" }}>
        {items.length === 0 ? (
          <p style={{ color: "white", fontSize: 15, textAlign: "center" }}>
            まだ手がかりはありません。虫眼鏡でQRコードを探しましょう。
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{ background: "white", borderRadius: 6, padding: 12 }}
              >
                <h3 style={{ margin: "0 0 4px", fontSize: 16, color: "#1a1a1a" }}>{item.name}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
