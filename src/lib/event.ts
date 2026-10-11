// 【役割】イベントの時刻の設定。画面（ブラウザ）とサーバーの両方から使う。
//
// 【変更すると】
//  - EVENT_END_AT … イベントの終了時刻。この時刻を過ぎると、参加者は虫眼鏡（QRの読み取り）を使えなくなる
//    （運営用アカウント admin は終了後も使える）。日本時間で書く（末尾の +09:00 を消さない）
//  - 終了前の案内・終了のメッセージは、データベースに予約して送っている（scripts/schedule-end-messages.mts）

export const EVENT_END_AT = new Date("2026-10-11T16:00:00+09:00");

export function isEventOver(now: Date = new Date()): boolean {
  return now.getTime() >= EVENT_END_AT.getTime();
}
