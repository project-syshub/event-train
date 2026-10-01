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
  qrCode: string;
};

// TODO: PostgreSQLのcluesテーブルに置き換える。現時点ではモックデータ。
export const mockClues: ClueDefinition[] = [
  // 車庫から消えた1両（電車事業所前）
  {
    id: "densha-1",
    qrCode: "41z1i7obehp6",
    caseId: "densha-jigyosho-mae",
    name: "懐中電灯",
    description: "車庫の奥を照らすと、床に引きずったような跡が見つかった。",
  },
  {
    id: "densha-2",
    qrCode: "cz3yrxxb3cbp",
    caseId: "densha-jigyosho-mae",
    name: "整備記録の写し",
    description: "事故当日の整備記録に、不自然な空白のページがある。",
  },
  {
    id: "densha-3",
    qrCode: "p20zhgucsv1f",
    caseId: "densha-jigyosho-mae",
    name: "防犯カメラの静止画",
    description: "車庫の出入口を写した一枚。なぜか時刻表示だけが消えている。",
  },
  {
    id: "densha-4",
    qrCode: "u44enodfbsx5",
    caseId: "densha-jigyosho-mae",
    name: "青色の繊維くず",
    description: "現場近くで見つかった、作業服とは異なる素材の繊維。",
  },

  // 公園通りの目撃者（中島公園通）
  {
    id: "nakajima-1",
    qrCode: "xwm6h17cbudb",
    caseId: "nakajima-koen-dori",
    name: "目撃者の証言メモ",
    description: "現場から立ち去った人物の背格好が書き留められている。",
  },
  {
    id: "nakajima-2",
    qrCode: "j3gqwfot58yq",
    caseId: "nakajima-koen-dori",
    name: "落とし物の腕時計",
    description: "現場付近で見つかった、針が止まったままの腕時計。",
  },
  {
    id: "nakajima-3",
    qrCode: "t4aujgkx97m6",
    caseId: "nakajima-koen-dori",
    name: "防犯ブザーの破片",
    description: "争ったような形跡とともに落ちていた。",
  },
  {
    id: "nakajima-4",
    qrCode: "njxjwkde4aei",
    caseId: "nakajima-koen-dori",
    name: "タクシーの領収書",
    description: "事件があった時刻の直後、近くから発行されたもの。",
  },

  // 深夜の停留所の悲鳴（西15丁目）
  {
    id: "nishi15-1",
    qrCode: "手がかり①",
    caseId: "nishi-15-choume",
    name: "上下分離の図",
    description:
      "市電の運行は札幌市交通事業振興公社（上）、施設や車両の保有整備は札幌市交通局（下）が受け持っているようだ。",
    image: "/clues/nishi15-1.jpg",
  },
  {
    id: "nishi15-2",
    qrCode: "s4nyh03qp1a9",
    caseId: "nishi-15-choume",
    name: "落ちていたボタン",
    description: "コートの一部と思われる、金属製のボタン。",
  },
  {
    id: "nishi15-3",
    qrCode: "0qkv2ve49cti",
    caseId: "nishi-15-choume",
    name: "争ったような足跡",
    description: "停留所脇の砂地に、複数人分の足跡が残っていた。",
  },
  {
    id: "nishi15-4",
    qrCode: "oedkybstcn4z",
    caseId: "nishi-15-choume",
    name: "割れたスマートフォン",
    description: "画面は割れているが、通話履歴の一部が読み取れる。",
  },
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

// 見つけた手がかりを先頭に並べ、残りを未発見の枠（「？」）で埋める
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
