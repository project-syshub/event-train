// 【役割】事件の一覧（タイトル・状態・要約・手がかりの枠の数）。
//
// 【変更すると】
//  - status    … 事件の状態（unsolved=未解決 / investigating=捜査中 / solved=解決済み）
//  - title     … 事件ページの見出しと、別の事件の手がかりを見つけたときの「『○○』の手がかりを発見！」に出る
//  - clueSlots … 事件ページに並ぶ手がかりの枠（「？」）の数。clues.ts のその事件の手がかりの数と合わせる
//  - id        … 事件ページのURL（/case/<id>）になる。変えると古いURLは開けなくなる
//  - stationKey… 路線図のどの駅の事件か（stations.ts の targetStationKeys に入っている必要がある）
//  - statusColor … 状態ごとの色（今は路線図では使っていない）
//  - unlockedByClueId … 隠し事件にするとき、出現の条件になる手がかりのid。その手がかりを見つけるまでは
//                       路線図に出ず、事件ページも開けない（狸小路のループ事件で使用）
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
  // 事件の要約文（今はどの画面にも表示していない）
  summary: string;
  // この事件で集める手がかりの数（未発見分は「？」の枠として表示する）
  clueSlots: number;
  // 隠し事件の出現条件（この手がかりを見つけると、路線図に現れて事件ページを開けるようになる）
  unlockedByClueId?: string;
};

// その事件がもう現れているか（隠し事件でなければ常に true）
export function isCaseUnlocked(caseInfo: CaseInfo, foundClueIds: string[]): boolean {
  return !caseInfo.unlockedByClueId || foundClueIds.includes(caseInfo.unlockedByClueId);
}

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
    title: "白いもの盗難事件",
    status: "unsolved",
    summary:
      "電車事業所の車庫から車両が1両忽然と消えた。夜間の警備員は「青白い光」を目撃したと証言している。",
    clueSlots: 8,
  },
  {
    id: "nakajima-koen-dori",
    stationKey: "nakajima-koen-dori",
    title: "夜空から消えたシリウス事件",
    status: "unsolved",
    summary:
      "中島公園通沿いのビルで起きた騒動。複数の目撃証言が寄せられているが、犯人はまだ分かっていない。",
    clueSlots: 4,
  },
  {
    id: "nishi-15-choume",
    stationKey: "nishi-15-choume",
    title: "恐怖！謎のびしょ濡れ事件",
    status: "unsolved",
    summary:
      "西15丁目停留所付近で深夜に悲鳴が聞かれたが、現場には誰もいなかった。目撃情報を募集中。",
    clueSlots: 5,
  },
  {
    // 隠し事件：ホームの路線図の線路を一周なぞると、狸小路に現れる
    id: "tanuki-koji",
    stationKey: "tanuki-koji",
    title: "迷子の報酬係を探せ",
    status: "unsolved",
    summary: "街をひとめぐりした探偵のもとに、狸小路で待つ報酬係から手紙が届いた。",
    clueSlots: 2,
    unlockedByClueId: "tanuki-1",
  },
];
