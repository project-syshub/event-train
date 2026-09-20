"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSettings } from "react-icons/fi";

export default function AccountMenu({ loginId }: { loginId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        className="icon-button"
        onClick={() => setOpen((value) => !value)}
        aria-label="設定"
        aria-expanded={open}
        style={{ width: 40, height: 40 }}
      >
        <FiSettings size={20} />
      </button>

      {open && (
        <>
          {/* 外側クリックで閉じるための透明レイヤー */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 15 }}
          />
          <div
            className="surface-panel"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: 16,
              width: 200,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
              zIndex: 20,
            }}
          >
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 4 }}>
              ログイン中
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{loginId}</p>
            <button onClick={handleLogout} style={{ width: "100%" }}>
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}
