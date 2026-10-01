import Image from "next/image";
import type { CSSProperties } from "react";
import type { ClueItem } from "@/lib/clues";
import { PuzzleIcon } from "@/components/icons";

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

// 手がかりの写真。画像が未設定の手がかりはパズルのアイコンで代用する
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
      ) : (
        <PuzzleIcon size={iconSize} />
      )}
    </div>
  );
}
