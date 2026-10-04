"use client";

// 【役割】ホーム右上の設定（歯車）メニュー。ログイン中のID・手がかりリセット・ログアウトを表示する。
//
// 【変更すると】
//  - パネルの width … メニューの幅
//  - 確認ダイアログの文言（window.confirm）… リセット前に出るメッセージ
//  - ボタンを追加 … このパネルの中にボタンを並べれば設定項目を増やせる

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

  // TODO: テスト用。不要になったらボタンごと削除する
  async function handleResetClues() {
    if (!window.confirm("すべての事件の手がかりを削除して、最初の状態に戻します。よろしいですか？")) return;

    const response = await fetch("/api/clues/reset", { method: "POST" }).catch(() => null);
    if (!response?.ok) {
      window.alert("リセットに失敗しました。もう一度試してください。");
      return;
    }
    setOpen(false);
    router.refresh();
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
            <button
              className="button-secondary"
              onClick={handleResetClues}
              style={{ width: "100%", marginBottom: 10 }}
            >
              手がかりをリセット
            </button>
            <button onClick={handleLogout} style={{ width: "100%" }}>
              ログアウト
            </button>
          </div>
        </>
      )}
    </div>
  );
}
