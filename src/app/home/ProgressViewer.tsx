"use client";

// 【役割】運営用アカウント（admin）専用。参加者ごとに、どの手がかりをいつ入手したかを見る画面。
// 設定メニューの「手がかりの入手状況」から開く。IDを押すと、そのIDが入手した手がかりの一覧が開く。
//
// 【変更すると】
//  - 時刻の表示 … formatTime（今は「月/日 時:分」）

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "@/app/case/[caseId]/overlayStyles";
import type { ParticipantProgress } from "@/lib/progress-types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ProgressViewer({ onClose }: { onClose: () => void }) {
  const [participants, setParticipants] = useState<ParticipantProgress[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/progress", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => !cancelled && setParticipants(data?.participants ?? []))
      .catch(() => !cancelled && setParticipants([]));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const active = participants?.filter((p) => p.clues.length > 0).length ?? 0;

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
          padding: 16,
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: "calc(100dvh - 96px)",
          overflowY: "auto",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 800, textAlign: "center" }}>手がかりの入手状況</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
          <span>{participants ? `入手した人：${active} / ${participants.length}人` : "読み込み中..."}</span>
          <button
            className="button-secondary"
            onClick={() => {
              setParticipants(null);
              setReloadKey((key) => key + 1);
            }}
            style={{ fontSize: 12, padding: "4px 10px" }}
          >
            更新
          </button>
        </div>

        {participants?.map((p) => {
          const last = p.clues.at(-1);
          const opened = openId === p.loginId;
          return (
            <div key={p.loginId} style={{ borderTop: "1px solid var(--color-border)", paddingTop: 8 }}>
              <button
                onClick={() => setOpenId(opened ? null : p.loginId)}
                disabled={p.clues.length === 0}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                  padding: "2px 0",
                  fontSize: 14,
                  color: "var(--color-text)",
                  opacity: p.clues.length === 0 ? 0.5 : 1,
                }}
              >
                <span style={{ fontWeight: 800 }}>
                  {p.clues.length > 0 ? (opened ? "▼ " : "▶ ") : "　 "}ID {p.loginId}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {p.clues.length}件{last ? ` / 最終 ${formatTime(last.foundAt)}` : ""}
                </span>
              </button>
              {opened && (
                <div style={{ padding: "6px 0 4px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.clues.map((clue, i) => (
                    <div key={i} style={{ fontSize: 12, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700 }}>{formatTime(clue.foundAt)}</span>　{clue.clueName}
                      <span style={{ display: "block", opacity: 0.75 }}>{clue.caseTitle}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
