// 【役割】手がかりの一覧（QRコードの文字列 → 手がかりの対応表）と、その照合処理。
//
// 【手がかりを追加・変更するとき】下の mockClues に1件ずつ書く。
//  - qrCode      … QRコードに入れた文字列と同じにする（1文字でも違うと「手がかりではない」になる。
//                  全角・半角の違い（「天文台１」と「天文台1」）は同じものとして扱う）
//  - caseId      … どの事件の手がかりか（cases.ts の stationKey と同じ値）。変えると表示される事件が変わる
//  - name        … カードと詳細に出る名前
//  - description … カードを押したときの詳細に出る説明文
//  - image       … 画像を public/clues/ に置き、"/clues/ファイル名.jpg" と書く。省略するとパズルのアイコンになる
//  - references  … 参考文献のURL（複数可）。詳細の一番下に表示する（リンクにはしない）。省略すると表示しない
//                  出典を添えるときは { url: "https://...", source: "出典の説明" } と書く（URLの下に「出典：〜」と出る）
//  - slot        … 事件ページで表示する枠の番号（1=左上 2=右上 3=左下 4=右下）。見つける前はその枠に「？」が出る
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
  // 参考文献のURL。詳細ポップアップの一番下に、押しても移動しない文字として表示する
  references?: ClueReference[];
};

// 参考文献。URLだけなら文字列で、出典を添えるなら { url, source } で書く
export type ClueReference = string | { url: string; source: string };

// QRコードの値はクライアントに渡さない（未発見の手がかりを推測できないようにする）
type ClueDefinition = ClueItem & {
  // 現地に貼るQRコードに埋め込む文字列そのもの。読み取った文字列と完全一致で照合する
  // （前後の空白と、全角・半角の違いは無視する。大文字・小文字は区別する）
  qrCode: string;
  // 事件ページの何番目の枠に表示するか（1から数える。2列なので 1=左上 2=右上 3=左下 4=右下）
  slot: number;
};

// TODO: PostgreSQLのcluesテーブルに置き換える。現時点ではここに直接書く。
// 追加するときは、下の見本か既存の1件をコピーして、該当する事件の見出しの下に貼る。
//   {
//     id: "nakajima-5",                ← 他と重ならない値
//     qrCode: "天文台5",                ← QRに入れる文字列
//     slot: 5,                         ← 表示する枠の番号（1=左上 2=右上 3=左下 4=右下）
//     caseId: "nakajima-koen-dori",    ← 見出しの caseId をコピー
//     name: "古びた鍵",
//     description: "1行目\n2行目",     ← \n で改行
//     image: "/clues/nakajima-5.jpg",  ← 画像がなければこの行ごと消す
//     references: ["https://..."],     ← 参考文献のURL（なければこの行ごと消す。出典付きは { url, source }）
//   },
export const mockClues: ClueDefinition[] = [
  // ===== 白いもの盗難事件（電車事業所前） caseId: "densha-jigyosho-mae" =====

  // ===== 夜空から消えたシリウス事件（中島公園通） caseId: "nakajima-koen-dori" =====
  {
    id: "nakajima-1",
    qrCode: "天文台1",
    slot: 1,
    caseId: "nakajima-koen-dori",
    name: "上下分離の図",
    description:
      "市電の運行を安定して続けていくため、仕事を「上下」に分けています。“上”は市電を走らせる仕事、“下”は車両や線路などを支える仕事です。",
    image: "/clues/joge-bunri.jpg",
    references: ["https://www.city.sapporo.jp/st/shiden/jyougebunri.html"],
  },
  {
    id: "nakajima-2",
    qrCode: "天文台2",
    slot: 2,
    caseId: "nakajima-koen-dori",
    name: "A1200形のデータ",
    // \n の位置で改行して表示する
    description: "運行開始した年：2013年\n定員：71人\n座席数：27席\n低床車両\n愛称：ポラリス",
    image: "/clues/a1200-polaris.jpg",
    references: [
      "https://www.stsp.or.jp/museum/a1200%E5%BD%A2/",
      "https://www.city.sapporo.jp/shimin/bunkazai/documents/bunkazaisanpo_romendensya.pdf",
    ],
  },
  {
    id: "nakajima-3",
    qrCode: "天文台3",
    slot: 3,
    caseId: "nakajima-koen-dori",
    name: "A1210形のデータ",
    description: "運行開始した年：2025年\n定員：75人\n座席数：27席\n低床車両\n愛称：ポラリスⅡ",
    image: "/clues/a1210-polaris2.jpg",
    references: [
      "https://www.stsp.or.jp/museum/a1210%e5%bd%a2/",
      "https://www.city.sapporo.jp/shimin/bunkazai/documents/bunkazaisanpo_romendensya.pdf",
    ],
  },
  {
    id: "nakajima-4",
    qrCode: "天文台4",
    slot: 4,
    caseId: "nakajima-koen-dori",
    name: "1100形の愛称",
    description: "この車両の愛称は、太陽を除いて地球から最も明るく見える星の名前。\n来場者の投票で選ばれました。",
    image: "/clues/1100-sirius.jpg",
    references: [
      {
        url: "https://x.com/sapporokotsu_PR/status/1054599031970615297",
        source: "札幌市交通局 公式X（2018年10月23日投稿）",
      },
    ],
  },

  // ===== 恐怖！謎のびしょ濡れ事件（西15丁目） caseId: "nishi-15-choume" =====
];

// QRを作るときの入力の揺れで一致しなくならないよう、全角の英数字を半角にそろえ、前後の空白を除く
// （例：「天文台１」と「天文台1」を同じものとして扱う）
function normalizeQrText(text: string): string {
  return text.normalize("NFKC").trim();
}

function toClueItem({ id, caseId, name, description, image, references }: ClueDefinition): ClueItem {
  return { id, caseId, name, description, image, references };
}

// 読み取ったQRコードの文字列から手がかりを引く。手がかり用でなければnull
export function findClueByQrText(text: string): ClueItem | null {
  const code = normalizeQrText(text);
  const clue = mockClues.find((c) => normalizeQrText(c.qrCode) === code);
  return clue ? toClueItem(clue) : null;
}

export type ClueSlot = { found: true; clue: ClueItem } | { found: false };

// 各手がかりを slot で決めた枠に置く。見つけた手がかりはその枠に中身を、まだのものや
// 手がかりが割り当てられていない枠には「？」を出す（見つけた順に詰めて並べることはしない）
export function getClueSlotsForCase(
  caseId: StationKey,
  slotCount: number,
  foundClueIds: string[]
): ClueSlot[] {
  const caseClues = mockClues.filter((clue) => clue.caseId === caseId);
  const count = Math.max(slotCount, ...caseClues.map((clue) => clue.slot));

  return Array.from({ length: count }, (_, index): ClueSlot => {
    const clue = caseClues.find((c) => c.slot === index + 1 && foundClueIds.includes(c.id));
    return clue ? { found: true, clue: toClueItem(clue) } : { found: false };
  });
}
