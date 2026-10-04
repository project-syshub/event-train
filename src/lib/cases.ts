// 【役割】事件の一覧（タイトル・状態・要約・手がかりの枠の数）。
//
// 【変更すると】
//  - status    … ホームの路線図のマーカーの色が変わる（unsolved=未解決 / investigating=捜査中 / solved=解決済み）
//  - title     … 事件ページの見出しと、別の事件の手がかりを見つけたときの「『○○』の手がかりを発見！」に出る
//  - clueSlots … 事件ページに並ぶ手がかりの枠（「？」）の数。clues.ts のその事件の手がかりの数と合わせる
//  - id        … 事件ページのURL（/case/<id>）になる。変えると古いURLは開けなくなる
//  - stationKey… 路線図のどの駅の事件か（stations.ts の targetStationKeys に入っている必要がある）
//  - statusColor … 状態ごとのマーカーの色
//
// 【事件を増やすとき】stations.ts の StationKey と targetStationKeys に駅を足してから、ここに1件追加する。
// 対象駅に事件がないと、ホーム画面がエラーになる。

import type { StationKey } from "./stations";

export type CaseStatus = "unsolved" | "investigating" | "solved";

export type CaseInfo = {
  id: string;
  stationKey: StationKey;
  title: string;
  status: CaseStatus;
  // ホーム画面のポップアップに表示する要約文
  summary: string;
  // この事件で集める手がかりの数（未発見分は「？」の枠として表示する）
  clueSlots: number;
};

export const statusLabel: Record<CaseStatus, string> = {
  unsolved: "未解決",
  investigating: "捜査中",
  solved: "解決済み",
};

// 探偵テーマの配色（深紅=未解決、真鍮=捜査中、くすんだ緑=解決済み）
export const statusColor: Record<CaseStatus, string> = {
  unsolved: "#b3402a",
  investigating: "#d4af37",
  solved: "#4a7c59",
};

// TODO: PostgreSQLのcasesテーブルに置き換える。現時点ではモックデータ。
export const mockCases: CaseInfo[] = [
  {
    id: "densha-jigyosho-mae",
    stationKey: "densha-jigyosho-mae",
    title: "車庫から消えた1両",
    status: "unsolved",
    summary:
      "電車事業所の車庫から車両が1両忽然と消えた。夜間の警備員は「青白い光」を目撃したと証言している。",
    clueSlots: 4,
  },
  {
    id: "nakajima-koen-dori",
    stationKey: "nakajima-koen-dori",
    title: "公園通りの目撃者",
    status: "unsolved",
    summary:
      "中島公園通沿いのビルで起きた騒動。複数の目撃証言が寄せられているが、犯人はまだ分かっていない。",
    clueSlots: 4,
  },
  {
    id: "nishi-15-choume",
    stationKey: "nishi-15-choume",
    title: "深夜の停留所の悲鳴",
    status: "unsolved",
    summary:
      "西15丁目停留所付近で深夜に悲鳴が聞かれたが、現場には誰もいなかった。目撃情報を募集中。",
    clueSlots: 4,
  },
];
