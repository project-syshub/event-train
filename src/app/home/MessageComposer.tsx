"use client";

// 【役割】運営用アカウント（admin）専用。参加者全員への一斉メッセージを書いて送る画面と、送ったメッセージの一覧。
// 設定メニューの「メッセージを送る」から開く。送ったメッセージは、ID 1〜50 の全員に届く（admin には届かない）。
//
// 【変更すると】
//  - 確認ダイアログの文言 … 送る前に出るメッセージ
//  - 1通の最大文字数 … lib/message-types.ts の MAX_MESSAGE_LENGTH

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "@/app/case/[caseId]/overlayStyles";
import { MAX_MESSAGE_LENGTH, type Message } from "@/lib/message-types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MessageComposer({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sent, setSent] = useState<Message[] | null>(null);

  // 送ったメッセージの一覧を読み込む（開いたときと、送信したあと）
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/messages")
      .then((response) => response.json())
      .then((data) => !cancelled && setSent(data?.messages ?? []))
      .catch(() => !cancelled && setSent([]));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleSend() {
    const body = text.trim();
    if (!body) return;
    if (!window.confirm("このメッセージを参加者全員に送ります。よろしいですか？")) return;

    setSending(true);
    const response = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }).catch(() => null);
    const data = await response?.json().catch(() => null);
    setSending(false);

    if (!response?.ok) {
      setNotice(data?.error ?? "送れませんでした。もう一度試してください。");
      return;
    }
    setText("");
    setNotice("送信しました");
    setReloadKey((key) => key + 1);
  }

  const length = [...text].length;

  return (
    <div style={overlayStyle}>
      <button className="icon-button" onClick={onClose} style={closeButtonStyle} aria-label="閉じる">
        <CloseIcon />
      </button>

      <div
        className="surface-panel"
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: 20,
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: "calc(100dvh - 96px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 800, textAlign: "center" }}>参加者全員にメッセージを送る</p>
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setNotice(null);
          }}
          rows={5}
          placeholder="例）15時に狸小路停留場に集合してください"
          style={{
            width: "100%",
            font: "inherit",
            fontSize: 16,
            color: "var(--color-text)",
            background: "rgba(0, 0, 0, 0.25)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: 10,
            resize: "vertical",
          }}
        />
        <p style={{ fontSize: 12, textAlign: "right", opacity: 0.8 }}>
          {length} / {MAX_MESSAGE_LENGTH}文字
        </p>
        <button onClick={handleSend} disabled={sending || length === 0 || length > MAX_MESSAGE_LENGTH}>
          {sending ? "送信中..." : "全員に送信する"}
        </button>
        {notice && <p style={{ fontSize: 14, fontWeight: 700, textAlign: "center" }}>{notice}</p>}

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>送ったメッセージ</p>
          {sent === null ? (
            <p style={{ fontSize: 13 }}>読み込み中...</p>
          ) : sent.length === 0 ? (
            <p style={{ fontSize: 13 }}>まだありません</p>
          ) : (
            sent.map((message) => (
              <div key={message.id} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, opacity: 0.75 }}>{formatTime(message.createdAt)}</p>
                <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{message.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
