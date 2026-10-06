"use client";

// 【役割】紙吹雪の演出。画面の上から色とりどりの紙片が舞い落ちる（ループ事件が現れたときに使う）。
// 画面の操作の邪魔をしないよう、紙片は押せない（タップは下のポップアップに届く）。
//
// 【変更すると】
//  - PIECE_COUNT … 紙片の数（多いほど華やかだが、古いスマホでは重くなる）
//  - COLORS … 紙片の色
//  - FALL_MIN_MS / FALL_MAX_MS … 落ちきるまでの時間の範囲
//  - 動き方そのものは globals.css の @keyframes confetti-fall

import { useState, type CSSProperties } from "react";

const PIECE_COUNT = 90;
const COLORS = ["#f5c518", "#e2542a", "#ffffff", "#8fd3f4", "#d32a20", "#4a9d5f", "#f2b134"];
const FALL_MIN_MS = 2200;
const FALL_MAX_MS = 3800;

type Piece = {
  left: number; // 画面の左端からの位置（%）
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  drift: number; // 落ちる間に横へ流れる距離（px）
  spin: number; // 落ちる間に回る角度（度）
  round: boolean; // 丸い紙片か
};

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, () => {
    const size = 6 + Math.random() * 6;
    return {
      left: Math.random() * 100,
      width: size,
      height: size * (0.4 + Math.random() * 0.8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 600,
      duration: FALL_MIN_MS + Math.random() * (FALL_MAX_MS - FALL_MIN_MS),
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720),
      round: Math.random() < 0.25,
    };
  });
}

export default function Confetti() {
  // 紙片の位置や色は、表示したときに一度だけ決める
  const [pieces] = useState(makePieces);

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 110 }}
    >
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.height,
              background: piece.color,
              borderRadius: piece.round ? "50%" : 1,
              animationDelay: `${piece.delay}ms`,
              animationDuration: `${piece.duration}ms`,
              "--drift": `${piece.drift}px`,
              "--spin": `${piece.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
