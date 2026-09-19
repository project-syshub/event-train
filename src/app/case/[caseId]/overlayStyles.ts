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

export const closeButtonStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "1px solid var(--color-accent)",
  background: "var(--color-surface)",
  color: "var(--color-accent-strong)",
  fontSize: 20,
  lineHeight: 1,
  cursor: "pointer",
};
