// 【役割】手がかりの一覧（QRコードの文字列 → 手がかりの対応表）と、その照合処理。
//
// 【手がかりを追加・変更するとき】下の mockClues に1件ずつ書く。
//  - qrCode      … QRコードに入れた文字列と同じにする（1文字でも違うと「手がかりではない」になる。
//                  全角・半角の違い（「天文台１」と「天文台1」）は同じものとして扱う）
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
  // （前後の空白と、全角・半角の違いは無視する。大文字・小文字は区別する）
  qrCode: string;
};

// TODO: PostgreSQLのcluesテーブルに置き換える。現時点ではここに直接書く。
// 追加するときは、下の見本か既存の1件をコピーして、該当する事件の見出しの下に貼る。
//   {
//     id: "nishi15-5",                 ← 他と重ならない値
//     qrCode: "天文台5",                ← QRに入れる文字列
//     caseId: "nishi-15-choume",       ← 見出しの caseId をコピー
//     name: "古びた鍵",
//     description: "1行目\n2行目",     ← \n で改行
//     image: "/clues/nishi15-5.jpg",   ← 画像がなければこの行ごと消す
//   },
export const mockClues: ClueDefinition[] = [
  // ===== 白いもの盗難事件（電車事業所前） caseId: "densha-jigyosho-mae" =====

  // ===== 夜空から消えたシリウス事件（中島公園通） caseId: "nakajima-koen-dori" =====

  // ===== 恐怖！謎のびしょ濡れ事件（西15丁目） caseId: "nishi-15-choume" =====
  {
    id: "nishi15-1",
    qrCode: "天文台1",
    caseId: "nishi-15-choume",
    name: "上下分離の図",
    description:
      "市電の運行を安定して続けていくため、仕事を「上下」に分けています。“上”は市電を走らせる仕事、“下”は車両や線路などを支える仕事です。",
    image: "/clues/joge-bunri.jpg",
  },
  {
    id: "nishi15-2",
    qrCode: "天文台2",
    caseId: "nishi-15-choume",
    name: "A1200形のデータ",
    // \n の位置で改行して表示する
    description: "運行開始した年：2013年\n定員：71人\n座席数：27席\n低床車両\n愛称：ポラリス",
    image: "/clues/a1200-polaris.jpg",
  },
  {
    id: "nishi15-3",
    qrCode: "天文台3",
    caseId: "nishi-15-choume",
    name: "A1210形のデータ",
    description: "運行開始した年：2025年\n定員：75人\n座席数：27席\n低床車両\n愛称：ポラリスⅡ",
    image: "/clues/a1210-polaris2.jpg",
  },
  {
    id: "nishi15-4",
    qrCode: "天文台4",
    caseId: "nishi-15-choume",
    name: "1100形の愛称",
    description:
      "「シリウス」は、太陽を除いて地球から最も明るく見える星。街中をさっそうと走る姿と、「明るい都市・札幌」をイメージして名付けられました。",
    image: "/clues/1100-sirius.jpg",
  },
];

// QRを作るときの入力の揺れで一致しなくならないよう、全角の英数字を半角にそろえ、前後の空白を除く
// （例：「天文台１」と「天文台1」を同じものとして扱う）
function normalizeQrText(text: string): string {
  return text.normalize("NFKC").trim();
}

function toClueItem({ id, caseId, name, description, image }: ClueDefinition): ClueItem {
  return { id, caseId, name, description, image };
}

// 読み取ったQRコードの文字列から手がかりを引く。手がかり用でなければnull
export function findClueByQrText(text: string): ClueItem | null {
  const code = normalizeQrText(text);
  const clue = mockClues.find((c) => normalizeQrText(c.qrCode) === code);
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
