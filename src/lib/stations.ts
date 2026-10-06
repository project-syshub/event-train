// 【役割】ホームの路線図に描く駅・線路の形と、事件が起きている駅（対象駅）の定義。
//
// 【変更すると】
//  - allRouteStations の x, y … 路線図上の駅の位置が動く（駅は ROUTE_CORNERS の線の上に置く）
//  - allRouteStations の label … 駅名を丸のどちら側（top / bottom / left / right）に出すか
//  - ROUTE_CORNERS … 線路の角の位置。ここを結んだ線（角は丸める）が路線になる
//  - targetStationKeys … 虫眼鏡のマーカー（押すと事件ページへ）を出す駅
//  - VIEW_X / VIEW_Y / VIEW_WIDTH / VIEW_HEIGHT … 画面に表示する範囲（左上の座標と幅・高さ）。
//    駅や駅名がはみ出したら広げ、余白が目立つなら狭める（狭めるほど路線図が大きく表示される）
//
// 【対象駅を増やすとき】StationKey と targetStationKeys の両方に駅のkeyを足し、cases.ts に事件を追加する。

// 事件が紐づく駅のkey。ここにない駅には事件や手がかりを結びつけられない
export type StationKey = "densha-jigyosho-mae" | "nakajima-koen-dori" | "nishi-15-choume" | "tanuki-koji";

export type LabelSide = "top" | "bottom" | "left" | "right";

export type RouteStation = {
  key: string;
  name: string;
  // SVGの座標（VIEW_X〜VIEW_X+VIEW_WIDTH、VIEW_Y〜VIEW_Y+VIEW_HEIGHT の範囲が表示される）。札幌市電のループ線の形を、スマホの縦長の画面で
  // 駅名が読める大きさになるよう縦に伸ばして配置している
  x: number;
  y: number;
  label: LabelSide;
};

// 駅名や虫眼鏡まで含めて、路線図の絵がある部分だけを表示する範囲
export const VIEW_X = 30;
export const VIEW_Y = 48;
// 右端は狸小路（x=390）の虫眼鏡マーカー（半径約15）が欠けないよう、少し余裕を持たせている
export const VIEW_WIDTH = 382;
export const VIEW_HEIGHT = 512;

// 線路の角（時計回り）。左上 → 右上 → 狸小路の下 → すすきの通りの左端 → 中央の列の下 → 左下
export const ROUTE_CORNERS: { x: number; y: number }[] = [
  { x: 140, y: 90 },
  { x: 390, y: 90 },
  { x: 390, y: 200 },
  { x: 300, y: 200 },
  { x: 300, y: 530 },
  { x: 140, y: 530 },
];

// 路線図の全駅。電車の進行方向（時計回り）の順に、西15丁目から1周ぶん定義する。
export const allRouteStations: RouteStation[] = [
  // 上の列（左 → 右）
  { key: "nishi-15-choume", name: "西15丁目", x: 185, y: 90, label: "top" },
  { key: "chuo-kuyakusho-mae", name: "中央区役所前", x: 252, y: 90, label: "top" },
  { key: "nishi-8-choume", name: "西8丁目", x: 308, y: 90, label: "top" },
  { key: "nishi-4-choume", name: "西4丁目", x: 356, y: 90, label: "top" },
  // 右の列（上 → 下）
  { key: "tanuki-koji", name: "狸小路", x: 390, y: 145, label: "left" },
  // すすきのの通り（右 → 左）
  { key: "susukino", name: "すすきの", x: 355, y: 200, label: "bottom" },
  { key: "shiseikan-shogakko-mae", name: "資生館小学校前", x: 322, y: 200, label: "top" },
  // 中央の列（上 → 下）
  { key: "higashi-honganji-mae", name: "東本願寺前", x: 300, y: 240, label: "right" },
  { key: "yamahana-9jo", name: "山鼻9条", x: 300, y: 283, label: "right" },
  { key: "nakajima-koen-dori", name: "中島公園通", x: 300, y: 326, label: "right" },
  { key: "gyokei-dori", name: "行啓通", x: 300, y: 369, label: "right" },
  { key: "seishugakuen-mae", name: "静修学園前", x: 300, y: 410, label: "right" },
  { key: "yamahana-19jo", name: "山鼻19条", x: 300, y: 450, label: "right" },
  { key: "konan-shogakko-mae", name: "幌南小学校前", x: 300, y: 490, label: "right" },
  // 下の列（右 → 左）
  { key: "higashi-tonden-dori", name: "東屯田通", x: 268, y: 530, label: "bottom" },
  { key: "ishiyama-dori", name: "石山通", x: 228, y: 530, label: "bottom" },
  { key: "chuo-toshokan-mae", name: "中央図書館前", x: 170, y: 530, label: "bottom" },
  // 左の列（下 → 上）
  { key: "densha-jigyosho-mae", name: "電車事業所前", x: 140, y: 485, label: "right" },
  { key: "ropeway-iriguchi", name: "ロープウェイ入口", x: 140, y: 430, label: "left" },
  { key: "nishisen-16jo", name: "西線16条", x: 140, y: 375, label: "left" },
  { key: "nishisen-14jo", name: "西線14条", x: 140, y: 320, label: "left" },
  { key: "nishisen-11jo", name: "西線11条", x: 140, y: 265, label: "left" },
  { key: "nishisen-9jo-asahiyama-koen-dori", name: "西線9条旭山公園通", x: 140, y: 210, label: "left" },
  { key: "nishisen-6jo", name: "西線6条", x: 140, y: 152, label: "left" },
];

// 事件が紐づく対象の駅。狸小路（ループ事件）は線路を一周なぞると現れる隠し事件で、
// それまでは普通の駅として表示する（出現の条件は cases.ts の unlockedByClueId）
export const targetStationKeys: StationKey[] = [
  "densha-jigyosho-mae",
  "nakajima-koen-dori",
  "nishi-15-choume",
  "tanuki-koji",
];

export function isTargetStation(key: string): key is StationKey {
  return (targetStationKeys as string[]).includes(key);
}
