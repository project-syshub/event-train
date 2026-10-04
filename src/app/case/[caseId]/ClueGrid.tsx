"use client";

// 【役割】事件ページの手がかり一覧（2列のカード）と、カードを押したとき・虫眼鏡で読み取ったときの詳細ポップアップ。
//
// 【変更すると】
//  - gridTemplateColumns の "1fr 1fr" … 1行に並ぶカードの数（"1fr 1fr 1fr" で3列）
//  - CAPTION_FONT_SIZE … カードの上（写真の白枠の外）の手がかり名の文字サイズ
//  - 未発見の枠の「？」の fontSize … 「？」の大きさ。文字を変えれば「？？？」などにもできる
//  - 詳細ポップアップの maxWidth … 詳細の横幅
//  - 参考文献の fontSize … 詳細の一番下に出る参考文献のURLの文字の大きさ
//  - 詳細ポップアップのタイトルの fontSize … 詳細の上に出る手がかり名の大きさ（全ての手がかりで共通）
//  - 写真の表示方法は CluePhoto.tsx で変える

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ClueItem, ClueSlot } from "@/lib/clues";
import { CloseIcon } from "@/components/icons";
import { overlayStyle, closeButtonStyle } from "./overlayStyles";
import CluePhoto from "./CluePhoto";

const CAPTION_FONT_SIZE = 14;
const CAPTION_LINE_HEIGHT = 1.3;
// タイトルが1行でも2行でもカードの高さが変わらないよう、2行ぶんで固定する
const CAPTION_HEIGHT = Math.round(CAPTION_FONT_SIZE * CAPTION_LINE_HEIGHT * 2) + 8;

const cardStyle: CSSProperties = {
  position: "relative",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  padding: 10,
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  color: "var(--color-text)",
  textAlign: "center",
};

// 未発見の枠の写真部分（写真入りのカードと高さを揃えるための空白）
const photoStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1",
};

// カードのタイトル（写真の白枠の外、茶色のカードの上部に白い文字で置く。詳細ポップアップと同じ配置）
const captionStyle: CSSProperties = {
  color: "var(--color-text)",
  fontWeight: 800,
  fontSize: CAPTION_FONT_SIZE,
  lineHeight: CAPTION_LINE_HEIGHT,
  height: CAPTION_HEIGHT,
  padding: "0 2px 6px",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

// 未発見の枠も同じ構造で描画することで、写真入りのカードと高さを揃える
function ClueCardBody({ clue }: { clue: ClueItem | null }) {
  const found = clue !== null;

  return (
    <>
      <p style={{ ...captionStyle, visibility: found ? "visible" : "hidden" }}>{found ? clue.name : ""}</p>
      <div
        style={{
          background: found ? "#ffffff" : "transparent",
          padding: 5,
          borderRadius: 2,
        }}
      >
        {found ? <CluePhoto clue={clue} iconSize={40} sizes="200px" /> : <div style={photoStyle} />}
      </div>

      {!found && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            fontWeight: 700,
          }}
        >
          ？
        </div>
      )}
    </>
  );
}

// URLの中の %E5%BD%A2 のような部分を、読める文字（「形」など）に戻して表示する
function readableUrl(url: string): string {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
}

export default function ClueGrid({ slots, openClueId }: { slots: ClueSlot[]; openClueId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selected, setSelected] = useState<ClueItem | null>(null);

  // 虫眼鏡で読み取った手がかり（URLの ?found=）の詳細を自動で開く。同じidで何度も開き直さないよう、開いたidを覚えておく
  const [openedClueId, setOpenedClueId] = useState<string | undefined>();
  if (openClueId && openClueId !== openedClueId) {
    setOpenedClueId(openClueId);
    const clue = slots.find((slot) => slot.found && slot.clue.id === openClueId);
    if (clue?.found) setSelected(clue.clue);
  }

  // 開いたら URL から ?found= を外す（再読み込みや戻る操作で、またポップアップが開かないように）
  useEffect(() => {
    if (openClueId) router.replace(pathname, { scroll: false });
  }, [openClueId, pathname, router]);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {slots.map((slot, index) =>
          slot.found ? (
            <button
              key={slot.clue.id}
              className="surface-panel"
              onClick={() => setSelected(slot.clue)}
              style={cardStyle}
              aria-label={`${slot.clue.name}の詳細を見る`}
            >
              <ClueCardBody clue={slot.clue} />
            </button>
          ) : (
            <div key={`unknown-${index}`} className="surface-panel" style={cardStyle}>
              <ClueCardBody clue={null} />
            </div>
          )
        )}
      </div>

      {selected && (
        <div style={overlayStyle} onClick={() => setSelected(null)}>
          <button
            className="icon-button"
            onClick={() => setSelected(null)}
            style={closeButtonStyle}
            aria-label="閉じる"
          >
            <CloseIcon />
          </button>

          <div
            className="surface-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              padding: 20,
              width: "100%",
              maxWidth: 300,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* タイトルは写真の白枠の外、茶色のパネルの上部に置く */}
            <p
              style={{
                color: "var(--color-text)",
                fontWeight: 800,
                fontSize: 20,
                lineHeight: 1.3,
                textAlign: "center",
              }}
            >
              {selected.name}
            </p>
            <div style={{ background: "#ffffff", padding: 5, borderRadius: 2 }}>
              <CluePhoto clue={selected} iconSize={64} sizes="300px" />
            </div>
            {/* 説明文の \n（clues.ts）をそのまま改行として表示する */}
            <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-line" }}>{selected.description}</p>
            {/* 参考文献（リンクにはせず、押しても移動しない文字として出す。長いURLは途中で折り返す） */}
            {selected.references && selected.references.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: 10,
                  fontSize: 11,
                  lineHeight: 1.5,
                  opacity: 0.85,
                }}
              >
                <p style={{ fontWeight: 700, marginBottom: 4 }}>参考文献</p>
                {selected.references.map((reference) => {
                  const { url, source } = typeof reference === "string" ? { url: reference, source: null } : reference;
                  return (
                    <div key={url} style={{ marginBottom: 4 }}>
                      <p style={{ overflowWrap: "anywhere" }}>{readableUrl(url)}</p>
                      {source && <p>出典：{source}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
