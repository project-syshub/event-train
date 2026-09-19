export type StationKey = "densha-jigyosho-mae" | "nakajima-koen-dori" | "nishi-15-choume";

export type RouteStation = {
  key: string;
  name: string;
  // SVG viewBox (0 0 400 550) 上のおおよその座標。
  // 実際の札幌市電の公式路線図（ループ線）をもとにした近似座標。
  x: number;
  y: number;
};

// 路線図の全駅。ループの並び順（1周する順序）で定義する。
// SC01(西4丁目)を起点に、SC02→…→SC24(狸小路)→SC01 の順。
export const allRouteStations: RouteStation[] = [
  { key: "nishi-4-choume", name: "西4丁目", x: 325, y: 63 },
  { key: "nishi-8-choume", name: "西8丁目", x: 250, y: 63 },
  { key: "chuo-kuyakusho-mae", name: "中央区役所前", x: 175, y: 63 },
  { key: "nishi-15-choume", name: "西15丁目", x: 63, y: 63 },
  { key: "nishisen-6jo", name: "西線6条", x: 38, y: 138 },
  { key: "nishisen-9jo-asahiyama-koen-dori", name: "西線9条旭山公園通", x: 38, y: 188 },
  { key: "nishisen-11jo", name: "西線11条", x: 38, y: 238 },
  { key: "nishisen-14jo", name: "西線14条", x: 38, y: 288 },
  { key: "nishisen-16jo", name: "西線16条", x: 38, y: 338 },
  { key: "ropeway-iriguchi", name: "ロープウェイ入口", x: 38, y: 388 },
  { key: "densha-jigyosho-mae", name: "電車事業所前", x: 38, y: 444 },
  { key: "chuo-toshokan-mae", name: "中央図書館前", x: 63, y: 500 },
  { key: "ishiyama-dori", name: "石山通", x: 113, y: 500 },
  { key: "higashi-tonden-dori", name: "東屯田通", x: 175, y: 500 },
  { key: "konan-shogakko-mae", name: "幌南小学校前", x: 238, y: 481 },
  { key: "yamahana-19jo", name: "山鼻19条", x: 238, y: 444 },
  { key: "seishugakuen-mae", name: "静修学園前", x: 238, y: 400 },
  { key: "gyokei-dori", name: "行啓通", x: 238, y: 350 },
  { key: "nakajima-koen-dori", name: "中島公園通", x: 238, y: 300 },
  { key: "yamahana-9jo", name: "山鼻9条", x: 238, y: 250 },
  { key: "higashi-honganji-mae", name: "東本願寺前", x: 238, y: 200 },
  { key: "shiseikan-shogakko-mae", name: "資生館小学校前", x: 238, y: 144 },
  { key: "susukino", name: "すすきの", x: 313, y: 156 },
  { key: "tanuki-koji", name: "狸小路", x: 363, y: 106 },
];

export const VIEW_WIDTH = 400;
export const VIEW_HEIGHT = 550;

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
