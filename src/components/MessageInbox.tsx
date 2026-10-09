"use client";

// 【役割】運営（admin）から届いた一斉メッセージを、参加者の画面にポップアップで表示する。
// ホームと事件ページに置いてあり、開いたときと、その後 POLL_INTERVAL_MS ごとに新着を確認する。
// 「確認しました」を押すと既読になり、同じメッセージはもう出ない（同じアカウントの別のスマホでも出なくなる）。
// 運営用アカウント（admin）には何も表示しない（enabled={false}）。
//
// 【変更すると】
//  - POLL_INTERVAL_MS … 新着を確認する間隔（短いほど早く届くが、通信が増える）
//  - 見出し（「運営からのお知らせ」）やボタンの文言 … このファイルの中の文字を直接変える

import { useEffect, useState } from "react";
import { overlayStyle } from "@/app/case/[caseId]/overlayStyles";
import type { Message } from "@/lib/message-types";

const POLL_INTERVAL_MS = 30_000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MessageInbox({ enabled = true }: { enabled?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function check() {
      // 画面が裏に回っているときは確認しない（戻ってきたときに確認する）
      if (document.visibilityState !== "visible") return;
      const response = await fetch("/api/messages", { cache: "no-store" }).catch(() => null);
      const data = await response?.json().catch(() => null);
      if (!cancelled && Array.isArray(data?.messages) && data.messages.length > 0) {
        setMessages(data.messages);
      }
    }

    check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [enabled]);

  async function handleClose() {
    const upToId = Math.max(...messages.map((message) => message.id));
    setMessages([]);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upToId }),
    }).catch(() => null);
  }

  if (messages.length === 0) return null;

  return (
    <div style={{ ...overlayStyle, zIndex: 200 }}>
      <div
        className="surface-panel letter-pop"
        style={{
          border: "2px solid #f5c518",
          borderRadius: 8,
          padding: 20,
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxHeight: "calc(100dvh - 64px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 900, textAlign: "center", color: "#f5c518" }}>運営からのお知らせ</p>
        {messages.map((message) => (
          <div key={message.id}>
            <p style={{ fontSize: 11, opacity: 0.75, marginBottom: 2 }}>{formatTime(message.createdAt)}</p>
            <p style={{ fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap", fontWeight: 600 }}>{message.body}</p>
          </div>
        ))}
        <button onClick={handleClose} style={{ alignSelf: "center", minWidth: 160 }}>
          確認しました
        </button>
      </div>
    </div>
  );
}
