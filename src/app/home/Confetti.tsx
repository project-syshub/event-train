"use client";

// 【役割】紙吹雪の演出（ループ事件が現れたときに使う）。画面の左下と右下から、クラッカーのように
// 斜め上へ紙片を打ち上げ、ひらひらと舞い落ちる。canvas に描くので、枚数が多くても重くなりにくい。
// 画面の操作の邪魔をしないよう、押せない（タップは下のポップアップに届く）。
//
// 【変更すると】
//  - PIECES_PER_SIDE … 左右それぞれから出す紙片の数（多いほど華やかだが、古いスマホでは重くなる）
//  - BURSTS / BURST_INTERVAL_MS … 何回に分けて打ち上げるかと、その間隔
//  - COLORS … 紙片の色
//  - LAUNCH_SPEED … 打ち上げの勢い（大きいほど高く・内側まで飛ぶ）
//  - GRAVITY / DRAG … 重力の強さと、空気でゆっくりになる具合
//  - MAX_FALL_SPEED … 舞い落ちるときの最高速度（小さいほどゆっくりひらひら落ちる）

import { useEffect, useRef } from "react";

const PIECES_PER_SIDE = 130;
const BURSTS = 2;
const BURST_INTERVAL_MS = 350;
const COLORS = ["#f5c518", "#e2542a", "#ffffff", "#8fd3f4", "#d32a20", "#4a9d5f", "#f2b134", "#c86dd7"];
// 速さは「60コマ/秒の画面で1コマに進む距離(px)」で表す（画面の更新が速い端末でも同じ速さになるよう補正する）
const LAUNCH_SPEED = 26;
const GRAVITY = 0.42;
const DRAG = 0.982;
const MAX_FALL_SPEED = 3.2;
// これ以上たったら、残っている紙片があっても描くのをやめる
const MAX_DURATION_MS = 9000;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  angle: number; // 紙片の向き
  spin: number; // 1コマで回る角度
  wobble: number; // ひらひら揺れる動きの位相
  wobbleSpeed: number;
};

// 画面の端（左なら x=0、右なら x=width）の下のほうから、内側の斜め上へ打ち上げる
function launch(side: "left" | "right", width: number, height: number): Piece[] {
  const direction = side === "left" ? 1 : -1;
  return Array.from({ length: Math.round(PIECES_PER_SIDE / BURSTS) }, () => {
    // 真上から 12〜50 度、内側へ傾けた向きに飛ばす
    const angle = ((12 + Math.random() * 38) * Math.PI) / 180;
    const speed = LAUNCH_SPEED * (0.6 + Math.random() * 0.5);
    const size = 6 + Math.random() * 7;
    return {
      x: side === "left" ? -5 : width + 5,
      y: height * (0.78 + Math.random() * 0.12),
      vx: direction * Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed,
      width: size,
      height: size * (0.45 + Math.random() * 0.6),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.08 + Math.random() * 0.12,
    };
  });
}

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    // 高解像度の画面でもぼやけないよう、画面の画素数に合わせる
    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    const pieces: Piece[] = [];
    const timers = Array.from({ length: BURSTS }, (_, i) =>
      setTimeout(() => {
        pieces.push(...launch("left", width, height), ...launch("right", width, height));
      }, i * BURST_INTERVAL_MS)
    );

    const startedAt = performance.now();
    let last = startedAt;
    let frame = requestAnimationFrame(function draw(now) {
      // 60コマ/秒を 1 とした経過時間（120Hzの画面なら約0.5）。タブの切り替えなどで大きく飛んだら抑える
      const step = Math.min((now - last) / (1000 / 60), 3);
      last = now;
      context.clearRect(0, 0, width, height);

      for (const piece of pieces) {
        const drag = Math.pow(DRAG, step);
        piece.vx *= drag;
        piece.vy = Math.min(piece.vy * drag + GRAVITY * step, MAX_FALL_SPEED);
        piece.wobble += piece.wobbleSpeed * step;
        // ひらひら舞うように、落ちるときは横に揺らす
        piece.x += (piece.vx + Math.cos(piece.wobble) * 0.8) * step;
        piece.y += piece.vy * step;
        piece.angle += piece.spin * step;

        if (piece.y > height + 20) continue;
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        // 紙が裏返るように、縦の長さを周期的に変える
        context.scale(1, Math.cos(piece.wobble));
        context.fillStyle = piece.color;
        context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        context.restore();
      }

      const allLaunched = now - startedAt > BURSTS * BURST_INTERVAL_MS;
      const allFallen = pieces.every((piece) => piece.y > height + 20);
      if ((allLaunched && allFallen) || now - startedAt > MAX_DURATION_MS) {
        context.clearRect(0, 0, width, height);
        return;
      }
      frame = requestAnimationFrame(draw);
    });

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 110 }}
    />
  );
}
