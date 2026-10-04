// 【役割】画面全体を覆うポップアップ（虫眼鏡・手がかりの詳細）の共通スタイル。
//
// 【変更すると】
//  - overlayStyle の background … 後ろの画面を暗くする濃さ（最後の 0.85 を小さくすると薄くなる）
//  - closeButtonStyle の top / right … 右上の「×」ボタンの位置

import type { CSSProperties } from "react";

export const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  padding: 32,
  zIndex: 100,
};

// 見た目・中央揃えはグローバルの .icon-button クラス側で指定する（位置とサイズのみここで指定）
export const closeButtonStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 40,
  height: 40,
};
