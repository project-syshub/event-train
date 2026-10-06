"use client";

// 【役割】ホーム画面を表示している間だけ、画面全体をスワイプで動かないよう固定する
// （スクロール・引っぱって更新・端のバウンド・ピンチでの拡大をさせない）。
// 線路を指でなぞる操作の最中に画面が動かないようにするため。ほかのページに移ると元に戻る。
// 固定の中身は globals.css の .screen-locked で決めている。

import { useEffect } from "react";

export default function ScreenLock() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("screen-locked");
    return () => root.classList.remove("screen-locked");
  }, []);

  return null;
}
