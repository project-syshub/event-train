"use client";

// 【役割】ループ事件で届く依頼主からの手紙。「手紙が届いた！」→「開封する」→ 手紙の本文、の順に表示する。
// 手紙を閉じると onClose が呼ばれ、HomeMap.tsx が手紙を狸小路の手がかりに入れる。
// 狸小路の手がかり一覧で手紙のカードを押したときは、opened を付けて開封済みの便せんから表示する（ClueGrid.tsx）。
//
// 【変更すると】
//  - 手紙の差出人と本文 … clues.ts の LETTER_SENDER / LETTER_BODY（**〜** で囲んだ部分は太字になる）
//  - PAPER_COLOR / INK_COLOR … 便せんの色と文字の色（封筒の絵は icons.tsx の EnvelopeIcon）
//  - LINE_HEIGHT … 便せんの行の高さ（小さくすると小さな画面でも収まりやすい）
//  - 「手紙が届いた！」などの文言 … このファイルの中の文字を直接変える

import { useState } from "react";
import { LETTER_BODY, LETTER_SENDER } from "@/lib/clues";
import { CloseIcon, EnvelopeIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "@/app/case/[caseId]/overlayStyles";

const PAPER_COLOR = "#fbf4e4";
const INK_COLOR = "#3b2a17";
// 便せんの1行の高さ（罫線の間隔もこれに合わせる）
const LINE_HEIGHT = 27;

export default function LetterOverlay({
  onClose,
  opened: initiallyOpened = false,
}: {
  onClose: () => void;
  // true なら「手紙が届いた！」の封筒を飛ばして、最初から便せんを表示する
  opened?: boolean;
}) {
  const [opened, setOpened] = useState(initiallyOpened);

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
          <EnvelopeIcon width={180} />
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
            padding: "20px 20px 18px",
            width: "100%",
            maxWidth: 340,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
            // 便せんの罫線（行の高さ LINE_HEIGHT に合わせる。スクロールしても文字と一緒に動く）
            backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_HEIGHT - 1}px, #e6d7b8 ${
              LINE_HEIGHT - 1
            }px, #e6d7b8 ${LINE_HEIGHT}px)`,
            backgroundAttachment: "local",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            // 画面に収まらない小さな端末では、便せんの中だけを指でスクロールできるようにする
            // （ホームは画面全体を固定しているが、ここだけは縦のスクロールを許す）
            maxHeight: "calc(100dvh - 48px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 500, lineHeight: `${LINE_HEIGHT}px`, whiteSpace: "pre-line" }}>
            {/* **〜** で囲んだ部分（奇数番目の区切り）だけを太字にする */}
            {LETTER_BODY.split("**").map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ fontWeight: 900 }}>
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, textAlign: "right", lineHeight: `${LINE_HEIGHT}px` }}>
            ― {LETTER_SENDER}より
          </p>
          <button className="button-secondary" onClick={onClose} style={{ alignSelf: "center", fontSize: 15 }}>
            手紙を閉じる
          </button>
        </div>
      )}
    </div>
  );
}
