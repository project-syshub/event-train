import type { StationKey } from "./stations";

export type ClueItem = {
  id: string;
  caseId: StationKey;
  name: string;
  description: string;
};

// TODO: 実際には虫眼鏡でQRコードを読み取るたびに取得する想定。現時点ではモックデータ。
export const mockClues: ClueItem[] = [
  {
    id: "clue-1",
    caseId: "densha-jigyosho-mae",
    name: "懐中電灯",
    description: "車庫の奥を照らすと、床に引きずったような跡が見つかった。",
  },
  {
    id: "clue-3",
    caseId: "nishi-15-choume",
    name: "停留所のベンチの傷",
    description: "何かを引きずったような細い傷が残っている。",
  },
];

export function getCluesForCase(caseId: StationKey): ClueItem[] {
  return mockClues.filter((clue) => clue.caseId === caseId);
}
