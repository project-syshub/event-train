"use client";

// 【役割】ループ事件で届く報酬係からの手紙。「手紙が届いた！」→「開封する」→ 手紙の本文、の順に表示する。
// 手紙を閉じると onClose が呼ばれ、HomeMap.tsx が手紙を狸小路の手がかりに入れる。
// 狸小路の手がかり一覧で手紙のカードを押したときは、opened を付けて開封済みの便せんから表示する（ClueGrid.tsx）。
//
// 【変更すると】
//  - 手紙の差出人と本文 … clues.ts の LETTER_SENDER / LETTER_BODY（**〜** で囲んだ部分は太字になる）
//  - PAPER_COLOR / INK_COLOR … 便せんの色と文字の色（封筒の絵は icons.tsx の EnvelopeIcon）
//  - LINE_HEIGHT … 便せんの行の高さ（小さくすると小さな画面でも収まりやすい）
//  - BODY_FONT_SIZE … 本文の文字の大きさ（一番長い行が便せんに収まるよう自動で決まる。最大15px）
//  - 「手紙が届いた！」などの文言 … このファイルの中の文字を直接変える

import { useState } from "react";
import { LETTER_BODY, LETTER_PLAIN_BODY, LETTER_SENDER } from "@/lib/clues";
import { CloseIcon, EnvelopeIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "@/app/case/[caseId]/overlayStyles";

const PAPER_COLOR = "#fbf4e4";
const INK_COLOR = "#3b2a17";
// 便せんの1行の高さ（罫線の間隔もこれに合わせる）
const LINE_HEIGHT = 27;
const PAPER_MAX_WIDTH = 360;
const OVERLAY_PADDING_X = 16;
const PAPER_PADDING_X = 16;
// 本文の文字の大きさ。本文は自動で折り返さず、書いた改行の位置だけで行を分けるので、
// 一番長い行が便せんの幅に収まるよう、文字の大きさを決める。
// （便せんの中の幅 ÷（一番長い行の文字数＋1）。＋1 は端末ごとの文字幅の違いに備えた余裕。最大は15px）
const LONGEST_LINE = Math.max(...LETTER_PLAIN_BODY.split("\n").map((line) => [...line].length));
const PAPER_INNER_WIDTH = `(min(100vw - ${OVERLAY_PADDING_X * 2}px, ${PAPER_MAX_WIDTH}px) - ${PAPER_PADDING_X * 2}px)`;
const BODY_FONT_SIZE = `min(15px, calc(${PAPER_INNER_WIDTH} / ${LONGEST_LINE + 1}))`;

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
    // 便せんを広く使えるよう、左右の余白は画面の端から OVERLAY_PADDING_X だけにする
    <div style={{ ...overlayStyle, paddingLeft: OVERLAY_PADDING_X, paddingRight: OVERLAY_PADDING_X }}>
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
            padding: `20px ${PAPER_PADDING_X}px 18px`,
            width: "100%",
            maxWidth: PAPER_MAX_WIDTH,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
            // 便せんの罫線（行の高さ LINE_HEIGHT に合わせる。スクロールしても文字と一緒に動く）
            backgroundImage: `repeating-linear-gradient(transparent, transparent ${LINE_HEIGHT - 1}px, #e6d7b8 ${
              LINE_HEIGHT - 1
            }px, #e6d7b8 ${LINE_HEIGHT}px)`,
            backgroundAttachment: "local",
            // 罫線を文字の行に合わせる（余白の内側＝1行目の文字の上端から数え始め、各行の下に線が来る）
            backgroundOrigin: "content-box",
            display: "flex",
            flexDirection: "column",
            // 署名も本文と同じ行の並びに乗るよう、段落の間はあけない
            gap: 0,
            // 画面に収まらない小さな端末では、便せんの中だけを指でスクロールできるようにする
            // （ホームは画面全体を固定しているが、ここだけは縦のスクロールを許す）
            maxHeight: "calc(100dvh - 48px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
          }}
        >
          {/* 自動で折り返さない（改行は clues.ts の LETTER_BODY に書いた位置だけ） */}
          <p style={{ fontSize: BODY_FONT_SIZE, fontWeight: 500, lineHeight: `${LINE_HEIGHT}px`, whiteSpace: "pre" }}>
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
          <p style={{ fontSize: BODY_FONT_SIZE, fontWeight: 700, textAlign: "right", lineHeight: `${LINE_HEIGHT}px` }}>
            ― {LETTER_SENDER}より
          </p>
          <button className="button-secondary" onClick={onClose} style={{ alignSelf: "center", fontSize: 15, marginTop: 12 }}>
            手紙を閉じる
          </button>
        </div>
      )}
    </div>
  );
}
