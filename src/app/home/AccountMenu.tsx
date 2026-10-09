"use client";

// 【役割】ホーム右上の設定（歯車）メニュー。ログイン中のIDとログアウトを表示する。
// 運営用アカウント（admin）のときだけ、メッセージ送信・手がかりリセット・全出しのボタンも出す。
//
// 【変更すると】
//  - パネルの width … メニューの幅
//  - 確認ダイアログの文言（window.confirm）… リセット前に出るメッセージ
//  - ボタンを追加 … このパネルの中にボタンを並べれば設定項目を増やせる

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSettings } from "react-icons/fi";
import { mockCases } from "@/lib/cases";
import MessageComposer from "./MessageComposer";

// isAdmin が true（運営用アカウント）のときだけ、リセット・全出し・メッセージ送信のボタンを出す
export default function AccountMenu({ loginId, isAdmin }: { loginId: string; isAdmin: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [composing, setComposing] = useState(false);

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

  // TODO: テスト用。不要になったらボタンごと削除する（api/clues/grant/route.ts も）
  async function handleGrantClues(caseId: string, title: string) {
    if (!window.confirm(`「${title}」の手がかりを全部見つけた状態にします。よろしいですか？`)) return;

    const response = await fetch("/api/clues/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId }),
    }).catch(() => null);
    if (!response?.ok) {
      window.alert("手がかりを出せませんでした。もう一度試してください。");
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
              width: 240,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
              zIndex: 20,
            }}
          >
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 4 }}>
              ログイン中
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{loginId}</p>
            {/* 運営用アカウント（admin）だけに出す管理用のボタン */}
            {isAdmin && (
              <>
                <button
                  className="button-secondary"
                  onClick={() => {
                    setOpen(false);
                    setComposing(true);
                  }}
                  style={{ width: "100%", marginBottom: 8, justifyContent: "center" }}
                >
                  メッセージを送る
                </button>
                <button
                  className="button-secondary"
                  onClick={handleResetClues}
                  style={{ width: "100%", marginBottom: 8, justifyContent: "center" }}
                >
                  手がかりをリセット
                </button>
                {/* テスト用：事件ごとに手がかりを全部出す（狸小路の隠し事件も現れる） */}
                {mockCases.map((caseInfo) => (
                  <button
                    key={caseInfo.id}
                    className="button-secondary"
                    onClick={() => handleGrantClues(caseInfo.id, caseInfo.title)}
                    style={{ width: "100%", marginBottom: 8, fontSize: 12, justifyContent: "center", lineHeight: 1.3 }}
                  >
                    {/* 言葉の途中で折り返さないよう、事件名と後半で2行に分ける */}
                    <span style={{ display: "block", textAlign: "center" }}>
                      {caseInfo.title}
                      <br />
                      の手がかりを全部出す
                    </span>
                  </button>
                ))}
              </>
            )}
            <button onClick={handleLogout} style={{ width: "100%", marginTop: 4 }}>
              ログアウト
            </button>
          </div>
        </>
      )}

      {composing && <MessageComposer onClose={() => setComposing(false)} />}
    </div>
  );
}
