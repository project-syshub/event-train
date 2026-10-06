// 【役割】手がかりの写真（カード・詳細で共通）。clues.ts で image を指定した手がかりは画像、
// 指定していない手がかりはパズルのアイコンを表示する。
//
// 【変更すると】
//  - objectFit: "contain" … 画像全体が枠に収まる（余白が出ることがある）。"cover" にすると枠いっぱいに
//    広げて、はみ出した部分を切り取る
//  - aspectRatio: "1" … 写真の枠の縦横比（"4 / 3" などで横長に）

import Image from "next/image";
import type { CSSProperties } from "react";
import { LETTER_CLUE_ID, type ClueItem } from "@/lib/clues";
import { EnvelopeIcon, PuzzleIcon } from "@/components/icons";

const photoStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text)",
  background: "var(--color-surface-alt)",
  overflow: "hidden",
};

// 手がかりの写真。画像が未設定の手がかりはパズルのアイコンで代用する。
// 報酬係からの手紙（ループ事件）だけは、封筒の絵を出す
export default function CluePhoto({
  clue,
  iconSize,
  sizes,
}: {
  clue: ClueItem;
  iconSize: number;
  sizes: string;
}) {
  return (
    <div style={photoStyle}>
      {clue.image ? (
        <Image src={clue.image} alt={clue.name} fill sizes={sizes} style={{ objectFit: "contain" }} />
      ) : clue.id === LETTER_CLUE_ID ? (
        <div style={{ width: "80%", display: "flex", justifyContent: "center" }}>
          <EnvelopeIcon width={iconSize * 2.6} />
        </div>
      ) : (
        <PuzzleIcon size={iconSize} />
      )}
    </div>
  );
}
