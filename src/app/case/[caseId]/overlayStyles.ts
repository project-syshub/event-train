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
