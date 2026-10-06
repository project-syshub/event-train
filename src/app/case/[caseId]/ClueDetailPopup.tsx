"use client";

// 【役割】手がかりの詳細ポップアップ（タイトル・写真・説明文・参考文献）。
// 事件ページで手がかりのカードを押したときと、ホームで線路を一周なぞったときに表示する。
//
// 【変更すると】
//  - パネルの maxWidth … 詳細の横幅
//  - タイトルの fontSize … 詳細の上に出る手がかり名の大きさ（全ての手がかりで共通）
//  - heading … タイトルの上に出す一言（「ループ事件の手がかりを発見！」など。省略すると出ない）
//  - 参考文献の fontSize … 詳細の一番下に出る参考文献の文字の大きさ

import type { ClueItem } from "@/lib/clues";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";
import CluePhoto from "./CluePhoto";

export default function ClueDetailPopup({
  clue,
  heading,
  onClose,
}: {
  clue: ClueItem;
  heading?: string;
  onClose: () => void;
}) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <button
        className="icon-button"
        onClick={onClose}
        style={closeButtonStyle}
        aria-label="閉じる"
      >
        <CloseIcon />
      </button>

      <div
        className="surface-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
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
        {heading && (
          <p
            style={{
              color: "#f5c518",
              fontWeight: 900,
              fontSize: 16,
              lineHeight: 1.5,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {heading}
          </p>
        )}
        {/* タイトルは写真の白枠の外、茶色のパネルの上部に置く */}
        <p
          style={{
            color: "var(--color-text)",
            fontWeight: 800,
            fontSize: 20,
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          {clue.name}
        </p>
        <div style={{ background: "#ffffff", padding: 5, borderRadius: 2 }}>
          <CluePhoto clue={clue} iconSize={64} sizes="300px" />
        </div>
        {/* 説明文の \n（clues.ts）をそのまま改行として表示する */}
        <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-line" }}>{clue.description}</p>
        {/* 参考文献（日本語の名前だけを、押しても移動しない文字として出す） */}
        {clue.references && clue.references.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 10,
              fontSize: 11,
              lineHeight: 1.5,
              opacity: 0.85,
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: 4 }}>参考文献</p>
            {clue.references.map((reference) => (
              <p key={reference.url + reference.title} style={{ marginBottom: 2 }}>
                {reference.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
