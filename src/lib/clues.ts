// 【役割】手がかりの一覧（QRコードの文字列 → 手がかりの対応表）と、その照合処理。
//
// 【手がかりを追加・変更するとき】下の mockClues に1件ずつ書く。
//  - qrCode      … QRコードに入れた文字列とまったく同じにする（1文字でも違うと「手がかりではない」になる）
//  - caseId      … どの事件の手がかりか（cases.ts の stationKey と同じ値）。変えると表示される事件が変わる
//  - name        … カードと詳細に出る名前
//  - description … カードを押したときの詳細に出る説明文
//  - image       … 画像を public/clues/ に置き、"/clues/ファイル名.jpg" と書く。省略するとパズルのアイコンになる
//  - id          … 発見記録はこのidで保存している。一度公開したら変えない（変えるとその手がかりが未発見に戻る）
//
// 【注意】1つの事件の手がかりの数を増減したら、cases.ts の clueSlots（「？」の枠の数）も合わせる。
// 画像は public/ に置くため、URLを知っていれば発見前でも直接開ける。

import type { StationKey } from "./stations";

export type ClueItem = {
  id: string;
  caseId: StationKey;
  name: string;
  description: string;
  // 手がかりの写真（public/ からのパス）。ない場合はアイコンを表示する
  image?: string;
};

// QRコードの値はクライアントに渡さない（未発見の手がかりを推測できないようにする）
type ClueDefinition = ClueItem & {
  // 現地に貼るQRコードに埋め込む文字列そのもの。読み取った文字列と完全一致で照合する
  // （前後の空白は無視する。大文字・小文字は区別する）
  qrCode: string;
};

// TODO: PostgreSQLのcluesテーブルに置き換える。現時点ではここに直接書く。
// 下の見本をコピーして、// を外して1件ずつ追加する。事件ごとにまとめて書くと分かりやすい。
export const mockClues: ClueDefinition[] = [
  // ===== 車庫から消えた1両（電車事業所前） caseId: "densha-jigyosho-mae" =====

  // ===== 公園通りの目撃者（中島公園通） caseId: "nakajima-koen-dori" =====

  // ===== 深夜の停留所の悲鳴（西15丁目） caseId: "nishi-15-choume" =====
  // {
  //   id: "nishi15-1",
  //   qrCode: "a8Kx2mQ7pZ",
  //   caseId: "nishi-15-choume",
  //   name: "古びた鍵",
  //   description: "停留所のベンチの下に落ちていた。",
  //   image: "/clues/nishi15-1.jpg",
  // },
];

function toClueItem({ id, caseId, name, description, image }: ClueDefinition): ClueItem {
  return { id, caseId, name, description, image };
}

// 読み取ったQRコードの文字列から手がかりを引く。手がかり用でなければnull
export function findClueByQrText(text: string): ClueItem | null {
  const code = text.trim();
  const clue = mockClues.find((c) => c.qrCode === code);
  return clue ? toClueItem(clue) : null;
}

export type ClueSlot = { found: true; clue: ClueItem } | { found: false };

// 見つけた手がかりを先頭に並べ、残りを未発見の枠（「？」）で埋める。
// 並び順は mockClues に書いた順。決まった位置で「？」を中身に変えたい場合はここを変える
export function getClueSlotsForCase(
  caseId: StationKey,
  slotCount: number,
  foundClueIds: string[]
): ClueSlot[] {
  const found = mockClues.filter((clue) => clue.caseId === caseId && foundClueIds.includes(clue.id));
  const slots: ClueSlot[] = found.map((clue) => ({ found: true, clue: toClueItem(clue) }));

  while (slots.length < slotCount) {
    slots.push({ found: false });
  }

  return slots;
}
