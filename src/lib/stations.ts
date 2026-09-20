export type StationKey = "densha-jigyosho-mae" | "nakajima-koen-dori" | "nishi-15-choume";

export type RouteStation = {
  key: string;
  name: string;
  // SVG viewBox (0 0 340 468) 上のおおよその座標。6.0インチ程度のモバイル画面幅を想定したサイズ。
  // 実際の札幌市電の公式路線図（ループ線）をもとにした近似座標。
  x: number;
  y: number;
};

// 路線図の全駅。ループの並び順（1周する順序）で定義する。
// SC01(西4丁目)を起点に、SC02→…→SC24(狸小路)→SC01 の順。
export const allRouteStations: RouteStation[] = [
  { key: "nishi-4-choume", name: "西4丁目", x: 286, y: 46 },
  { key: "nishi-8-choume", name: "西8丁目", x: 218, y: 40 },
  { key: "chuo-kuyakusho-mae", name: "中央区役所前", x: 150, y: 40 },
  { key: "nishi-15-choume", name: "西15丁目", x: 54, y: 54 },
  { key: "nishisen-6jo", name: "西線6条", x: 32, y: 117 },
  { key: "nishisen-9jo-asahiyama-koen-dori", name: "西線9条旭山公園通", x: 32, y: 160 },
  { key: "nishisen-11jo", name: "西線11条", x: 32, y: 202 },
  { key: "nishisen-14jo", name: "西線14条", x: 32, y: 245 },
  { key: "nishisen-16jo", name: "西線16条", x: 32, y: 287 },
  { key: "ropeway-iriguchi", name: "ロープウェイ入口", x: 32, y: 330 },
  { key: "densha-jigyosho-mae", name: "電車事業所前", x: 32, y: 377 },
  { key: "chuo-toshokan-mae", name: "中央図書館前", x: 54, y: 425 },
  { key: "ishiyama-dori", name: "石山通", x: 96, y: 425 },
  { key: "higashi-tonden-dori", name: "東屯田通", x: 149, y: 425 },
  { key: "konan-shogakko-mae", name: "幌南小学校前", x: 210, y: 412 },
  { key: "yamahana-19jo", name: "山鼻19条", x: 210, y: 380 },
  { key: "seishugakuen-mae", name: "静修学園前", x: 210, y: 345 },
  { key: "gyokei-dori", name: "行啓通", x: 208, y: 300 },
  { key: "nakajima-koen-dori", name: "中島公園通", x: 206, y: 258 },
  { key: "yamahana-9jo", name: "山鼻9条", x: 204, y: 216 },
  { key: "higashi-honganji-mae", name: "東本願寺前", x: 210, y: 174 },
  { key: "shiseikan-shogakko-mae", name: "資生館小学校前", x: 220, y: 130 },
  { key: "susukino", name: "すすきの", x: 260, y: 110 },
  { key: "tanuki-koji", name: "狸小路", x: 288, y: 82 },
];

export const VIEW_WIDTH = 340;
export const VIEW_HEIGHT = 468;

// 事件が紐づく対象の駅（狸小路は対象外）
export const targetStationKeys: StationKey[] = [
  "densha-jigyosho-mae",
  "nakajima-koen-dori",
  "nishi-15-choume",
];

export type Station = {
  key: StationKey;
  name: string;
  x: number;
  y: number;
};

export const stations: Station[] = allRouteStations
  .filter((s): s is RouteStation & { key: StationKey } =>
    (targetStationKeys as string[]).includes(s.key)
  )
  .map((s) => ({ key: s.key, name: s.name, x: s.x, y: s.y }));
