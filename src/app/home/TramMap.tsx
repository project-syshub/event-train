// 【役割】ホームの路線図（線路・駅・事件の虫眼鏡マーカー）を描く。
// 事件のある駅の虫眼鏡・駅名を押すと、その事件のページへ移動する。
//
// 【変更すると】
//  - ROUTE_COLOR / ROUTE_WIDTH / CORNER_RADIUS … 線路の色・太さ・角の丸み
//  - STATION_RADIUS … 駅の白丸の大きさ
//  - STATION_FONT_SIZE / TARGET_FONT_SIZE … 駅名の文字サイズ（事件のない駅 / 事件のある駅）
//  - UNDERLINE_COLOR … 事件のある駅名の下線の色
//  - TARGET_TOP_LABEL_GAP … 事件のある駅名を上に出すときの、虫眼鏡からの離れ具合
//  - 駅の位置・駅名の向き・線路の角は stations.ts で変える

import Link from "next/link";
import {
  allRouteStations,
  isTargetStation,
  ROUTE_CORNERS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  VIEW_X,
  VIEW_Y,
  type LabelSide,
  type RouteStation,
  type StationKey,
} from "@/lib/stations";

export type MapMarker = {
  stationKey: StationKey;
  caseId: string;
};

const ROUTE_COLOR = "#ffffff";
const ROUTE_WIDTH = 4;
const CORNER_RADIUS = 16;
const STATION_RADIUS = 8;
const STATION_FONT_SIZE = 10.5;
const TARGET_FONT_SIZE = 13;
const UNDERLINE_COLOR = "#f5c518";
// 事件のある駅で、駅名を上に出すときの駅の中心から文字のベースラインまでの距離
const TARGET_TOP_LABEL_GAP = 27;

// 角を丸めた閉じた線のSVGパス
function roundedLoopPath(points: { x: number; y: number }[], radius: number): string {
  const n = points.length;
  const commands: string[] = [];

  points.forEach((corner, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    const toward = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      return {
        x: from.x + ((to.x - from.x) / length) * radius,
        y: from.y + ((to.y - from.y) / length) * radius,
      };
    };
    const start = toward(corner, prev);
    const end = toward(corner, next);
    commands.push(`${i === 0 ? "M" : "L"} ${start.x} ${start.y}`);
    commands.push(`Q ${corner.x} ${corner.y} ${end.x} ${end.y}`);
  });

  return commands.join(" ") + " Z";
}

const ROUTE_PATH = roundedLoopPath(ROUTE_CORNERS, CORNER_RADIUS);

// 文字の幅のおおよその見積もり（下線の長さとタブの幅に使う。全角は1文字=1em、半角は約0.6em）
function estimateTextWidth(text: string, fontSize: number): number {
  return [...text].reduce((width, char) => width + (char.charCodeAt(0) < 0x100 ? 0.6 : 1) * fontSize, 0);
}

function labelPosition(station: RouteStation, side: LabelSide, gap: number) {
  switch (side) {
    case "top":
      return { x: station.x, y: station.y - gap, anchor: "middle" as const };
    case "bottom":
      return { x: station.x, y: station.y + gap + STATION_FONT_SIZE * 0.8, anchor: "middle" as const };
    case "left":
      return { x: station.x - gap, y: station.y + STATION_FONT_SIZE * 0.35, anchor: "end" as const };
    case "right":
      return { x: station.x + gap, y: station.y + STATION_FONT_SIZE * 0.35, anchor: "start" as const };
  }
}

// 地図用の虫眼鏡マーカー（金縁＋水色レンズ、持ち手は左下向き）
function MapMagnifier({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x - 7} y1={y + 7} x2={x - 22} y2={y + 22} stroke="#e8b923" strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={y} r={12} fill="#8fd3f4" stroke="#e8b923" strokeWidth={4} />
      <circle cx={x} cy={y} r={14} fill="none" stroke="#ffffff" strokeWidth={1.2} />
      <ellipse cx={x - 3} cy={y - 4} rx={4.5} ry={2.4} fill="#ffffff" opacity={0.7} transform={`rotate(-30 ${x - 3} ${y - 4})`} />
    </g>
  );
}

export default function TramMap({ markers }: { markers: MapMarker[] }) {
  return (
    <svg
      viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      // 親要素の幅と高さに収まる最大の大きさで、上寄せで表示する（"xMidYMid meet" にすると上下中央）
      preserveAspectRatio="xMidYMin meet"
      style={{ width: "100%", height: "100%", display: "block" }}
      role="img"
      aria-label="札幌市電の路線図"
    >
      <path d={ROUTE_PATH} fill="none" stroke={ROUTE_COLOR} strokeWidth={ROUTE_WIDTH} strokeLinejoin="round" />

      {/* 事件のない駅：白丸と駅名 */}
      {allRouteStations
        .filter((station) => !isTargetStation(station.key))
        .map((station) => {
          const label = labelPosition(station, station.label, STATION_RADIUS + 5);
          return (
            <g key={station.key}>
              <circle cx={station.x} cy={station.y} r={STATION_RADIUS} fill="#ffffff" />
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize={STATION_FONT_SIZE}
                fontWeight={500}
                fill="#ffffff"
              >
                {station.name}
              </text>
            </g>
          );
        })}

      {/* 事件のある駅：虫眼鏡・下線付きの駅名（押すと事件ページへ） */}
      {markers.map((marker) => {
        const station = allRouteStations.find((s) => s.key === marker.stationKey);
        if (!station) return null;

        // 上側の駅名は下線が虫眼鏡に重ならないよう、ほかの向きより離す
        const label = labelPosition(station, station.label, station.label === "top" ? TARGET_TOP_LABEL_GAP : 19);
        const fontSize = TARGET_FONT_SIZE;
        const textWidth = estimateTextWidth(station.name, fontSize);
        const underlineStart =
          label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - textWidth : label.x - textWidth / 2;
        const baseline = station.label === "top" ? label.y : label.y + (fontSize - STATION_FONT_SIZE) * 0.35;

        return (
          <Link key={marker.stationKey} href={`/case/${marker.caseId}`} aria-label={`${station.name}の事件を調べる`}>
            <g style={{ cursor: "pointer" }}>
              <MapMagnifier x={station.x} y={station.y} />
              <line
                x1={underlineStart}
                y1={baseline + 4}
                x2={underlineStart + textWidth}
                y2={baseline + 4}
                stroke={UNDERLINE_COLOR}
                strokeWidth={3}
              />
              <text x={label.x} y={baseline} textAnchor={label.anchor} fontSize={fontSize} fontWeight={900} fill="#ffffff">
                {station.name}
              </text>
            </g>
          </Link>
        );
      })}
    </svg>
  );
}
