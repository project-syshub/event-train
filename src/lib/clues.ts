import type { StationKey } from "./stations";

export type ClueItem = {
  id: string;
  caseId: StationKey;
  name: string;
  description: string;
};

// TODO: 実際には虫眼鏡でQRコードを読み取るたびに取得する想定。現時点ではモックデータ。
export const mockClues: ClueItem[] = [
  // 車庫から消えた1両（電車事業所前）
  {
    id: "densha-1",
    caseId: "densha-jigyosho-mae",
    name: "懐中電灯",
    description: "車庫の奥を照らすと、床に引きずったような跡が見つかった。",
  },
  {
    id: "densha-2",
    caseId: "densha-jigyosho-mae",
    name: "整備記録の写し",
    description: "事故当日の整備記録に、不自然な空白のページがある。",
  },
  {
    id: "densha-3",
    caseId: "densha-jigyosho-mae",
    name: "防犯カメラの静止画",
    description: "車庫の出入口を写した一枚。なぜか時刻表示だけが消えている。",
  },
  {
    id: "densha-4",
    caseId: "densha-jigyosho-mae",
    name: "青色の繊維くず",
    description: "現場近くで見つかった、作業服とは異なる素材の繊維。",
  },

  // 公園通りの目撃者（中島公園通）
  {
    id: "nakajima-1",
    caseId: "nakajima-koen-dori",
    name: "目撃者の証言メモ",
    description: "現場から立ち去った人物の背格好が書き留められている。",
  },
  {
    id: "nakajima-2",
    caseId: "nakajima-koen-dori",
    name: "落とし物の腕時計",
    description: "現場付近で見つかった、針が止まったままの腕時計。",
  },
  {
    id: "nakajima-3",
    caseId: "nakajima-koen-dori",
    name: "防犯ブザーの破片",
    description: "争ったような形跡とともに落ちていた。",
  },
  {
    id: "nakajima-4",
    caseId: "nakajima-koen-dori",
    name: "タクシーの領収書",
    description: "事件があった時刻の直後、近くから発行されたもの。",
  },

  // 深夜の停留所の悲鳴（西15丁目）
  {
    id: "nishi15-1",
    caseId: "nishi-15-choume",
    name: "停留所のベンチの傷",
    description: "何かを引きずったような細い傷が残っている。",
  },
  {
    id: "nishi15-2",
    caseId: "nishi-15-choume",
    name: "落ちていたボタン",
    description: "コートの一部と思われる、金属製のボタン。",
  },
  {
    id: "nishi15-3",
    caseId: "nishi-15-choume",
    name: "争ったような足跡",
    description: "停留所脇の砂地に、複数人分の足跡が残っていた。",
  },
  {
    id: "nishi15-4",
    caseId: "nishi-15-choume",
    name: "割れたスマートフォン",
    description: "画面は割れているが、通話履歴の一部が読み取れる。",
  },
];

export function getCluesForCase(caseId: StationKey): ClueItem[] {
  return mockClues.filter((clue) => clue.caseId === caseId);
}

export type ClueSlot = { found: true; clue: ClueItem } | { found: false };

// 見つけた手がかりを先頭に並べ、残りを未発見の枠（「？」）で埋める
export function getClueSlotsForCase(caseId: StationKey, slotCount: number): ClueSlot[] {
  const found = getCluesForCase(caseId);
  const slots: ClueSlot[] = found.map((clue) => ({ found: true, clue }));

  while (slots.length < slotCount) {
    slots.push({ found: false });
  }

  return slots;
}
