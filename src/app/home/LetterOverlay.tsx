"use client";

// 【役割】ループ事件で届く依頼主からの手紙。「手紙が届いた！」→「開封する」→ 手紙の本文、の順に表示する。
// 手紙を閉じると onClose が呼ばれ、HomeMap.tsx が手紙を狸小路の手がかりに入れる。
//
// 【変更すると】
//  - 手紙の差出人と本文 … clues.ts の LETTER_SENDER / LETTER_BODY（狸小路の手がかり一覧にも同じ文が入る）
//  - PAPER_COLOR / INK_COLOR … 便せんの色と文字の色
//  - 「手紙が届いた！」などの文言 … このファイルの中の文字を直接変える

import { useState } from "react";
import { LETTER_BODY, LETTER_SENDER } from "@/lib/clues";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "@/app/case/[caseId]/overlayStyles";

const PAPER_COLOR = "#fbf4e4";
const INK_COLOR = "#3b2a17";

// 封筒の絵（クリーム色の封筒に赤い封蝋）
function EnvelopeIcon() {
  return (
    <svg width={180} height={130} viewBox="0 0 180 130" aria-hidden="true">
      <rect x={4} y={10} width={172} height={114} rx={6} fill={PAPER_COLOR} stroke="#c9a97a" strokeWidth={3} />
      <path d="M6 14 L90 76 L174 14" fill="none" stroke="#c9a97a" strokeWidth={3} strokeLinejoin="round" />
      <path d="M6 120 L70 64 M174 120 L110 64" stroke="#e3d2b0" strokeWidth={2} />
      <circle cx={90} cy={76} r={15} fill="#b3261e" stroke="#7d1a14" strokeWidth={2} />
      <path d="M84 76 h12 M90 70 v12" stroke="#f3c7c2" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

export default function LetterOverlay({ onClose }: { onClose: () => void }) {
  const [opened, setOpened] = useState(false);

  return (
    <div style={overlayStyle}>
      {opened && (
        <button className="icon-button" onClick={onClose} style={closeButtonStyle} aria-label="手紙を閉じる">
          <CloseIcon />
        </button>
      )}

      {!opened ? (
        <div
          className="letter-pop"
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}
        >
          <EnvelopeIcon />
          <p style={{ color: "white", fontSize: 24, fontWeight: 900 }}>手紙が届いた！</p>
          <p style={{ color: "white", fontSize: 15, fontWeight: 700, lineHeight: 1.6 }}>
            {LETTER_SENDER}から、一通の手紙が届いたようだ…
          </p>
          <button onClick={() => setOpened(true)} style={{ minWidth: 180, fontSize: 17 }}>
            開封する
          </button>
        </div>
      ) : (
        <div
          className="letter-pop"
          style={{
            background: PAPER_COLOR,
            color: INK_COLOR,
            borderRadius: 4,
            padding: "28px 24px 24px",
            width: "100%",
            maxWidth: 330,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
            // 便せんの罫線
            backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #e6d7b8 31px, #e6d7b8 32px)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, lineHeight: "32px", whiteSpace: "pre-line" }}>{LETTER_BODY}</p>
          <p style={{ fontSize: 16, fontWeight: 700, textAlign: "right", lineHeight: "32px" }}>― {LETTER_SENDER}より</p>
          <button className="button-secondary" onClick={onClose} style={{ alignSelf: "center", fontSize: 15 }}>
            手紙を閉じる
          </button>
        </div>
      )}
    </div>
  );
}
