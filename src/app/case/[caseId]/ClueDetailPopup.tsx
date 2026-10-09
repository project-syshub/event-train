"use client";

// 【役割】手がかりの詳細ポップアップ（タイトル・写真・説明文・参考文献）。
// 事件ページで手がかりのカードを押したときと、ホームで線路を一周なぞったときに表示する。
//
// 【変更すると】
//  - パネルの maxWidth … 詳細の横幅
//  - タイトルの fontSize … 詳細の上に出る手がかり名の大きさ（全ての手がかりで共通）
//  - heading … タイトルの上に出す一言（「ループ事件の手がかりを発見！」など。省略すると出ない）
//  - 参考文献の fontSize … 詳細の一番下に出る参考文献の文字の大きさ
//  - COLOR_NAMES … 説明文の {{文字|色}} で使える色の名前と、実際の色

import type { ClueItem } from "@/lib/clues";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";
import CluePhoto from "./CluePhoto";

// 説明文の {{文字|色}} に使える色の名前（ほかに #ff0000 のような色の番号も書ける）
const COLOR_NAMES: Record<string, string> = {
  紫: "#7b2cbf",
  オレンジ: "#e8590c",
  黒: "#111111",
  ピンク: "#e64980",
  赤: "#d32a20",
  青: "#1c7ed6",
  緑: "#2b8a3e",
  黄: "#e0a800",
};

// 説明文の {{文字|色}} の部分だけを色付きの文字にする。茶色の背景でも黒や紫が見えるよう、
// 明るい下地を敷いて太字にする
function renderDescription(text: string) {
  return text.split(/(\{\{[^|}]+\|[^}]+\}\})/g).map((part, i) => {
    const match = part.match(/^\{\{([^|}]+)\|([^}]+)\}\}$/);
    if (!match) return part;
    const [, chars, color] = match;
    return (
      <span
        key={i}
        style={{
          color: COLOR_NAMES[color] ?? color,
          background: "#fbf4e4",
          borderRadius: 3,
          padding: "0 2px",
          margin: "0 1px",
          fontWeight: 900,
        }}
      >
        {chars}
      </span>
    );
  });
}

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
          // 説明文が長くて画面に収まらないときは、詳細の中だけを指でスクロールできるようにする
          // （ホーム画面は全体を固定しているが、ここだけは縦のスクロールを許す）
          maxHeight: "calc(100dvh - 48px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
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
        <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-line" }}>{renderDescription(clue.description)}</p>
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
              <p key={reference.title} style={{ marginBottom: 2 }}>
                {reference.title}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
