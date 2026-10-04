// 【役割】ホームの路線図（線路・進行方向の矢印・駅・事件の虫眼鏡マーカー・場所名の吹き出し）を描く。
// 虫眼鏡・駅名・吹き出しのどれを押しても、その事件のページへ移動する。
//
// 【変更すると】
//  - ROUTE_COLOR / ROUTE_WIDTH / CORNER_RADIUS … 線路の色・太さ・角の丸み
//  - STATION_RADIUS … 駅の白丸の大きさ
//  - STATION_FONT_SIZE / TARGET_FONT_SIZE … 駅名の文字サイズ（事件のない駅 / 事件のある駅）
//  - UNDERLINE_COLOR … 事件のある駅名の下線の色
//  - CASE_BUBBLES … 事件の吹き出しの位置と大きさ（pointer は吹き出しの「しっぽ」の先端）
//  - 吹き出しのタブの場所名は cases.ts の place で変える（吹き出しの中は今は空）
//  - 駅の位置・駅名の向き・線路の角は stations.ts で変える

import Link from "next/link";
import {
  allRouteStations,
  isTargetStation,
  ROUTE_CORNERS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type LabelSide,
  type RouteStation,
  type StationKey,
} from "@/lib/stations";

export type MapMarker = {
  stationKey: StationKey;
  caseId: string;
  place: string;
};

const ROUTE_COLOR = "#ffffff";
const ROUTE_WIDTH = 4;
const CORNER_RADIUS = 16;
const STATION_RADIUS = 8;
const STATION_FONT_SIZE = 10.5;
const TARGET_FONT_SIZE = 13;
const UNDERLINE_COLOR = "#f5c518";
const ARROW_SIZE = 5;
// 隣り合う駅（または角）の間がこれより狭いときは矢印を描かない
const ARROW_MIN_GAP = 30;

const BUBBLE_PLACE_FONT_SIZE = 8;

type Bubble = {
  x: number;
  y: number;
  width: number;
  height: number;
  // 吹き出しの右端から出る「しっぽ」の先端の位置
  pointer: { x: number; y: number };
};

// 事件の吹き出しの配置（stations.ts の座標系）
const CASE_BUBBLES: Record<StationKey, Bubble> = {
  "nishi-15-choume": { x: 6, y: 32, width: 124, height: 60, pointer: { x: 142, y: 62 } },
  "nakajima-koen-dori": { x: 158, y: 268, width: 114, height: 58, pointer: { x: 284, y: 302 } },
  "densha-jigyosho-mae": { x: 4, y: 446, width: 112, height: 44, pointer: { x: 127, y: 468 } },
};

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

// 進行方向の矢印。線路の角をたどりながら、各辺の上にある駅を順に並べ、隣り合う点の中間に置く
function computeArrows(): { x: number; y: number; angle: number }[] {
  const arrows: { x: number; y: number; angle: number }[] = [];

  ROUTE_CORNERS.forEach((from, i) => {
    const to = ROUTE_CORNERS[(i + 1) % ROUTE_CORNERS.length];
    const onEdge = allRouteStations
      .filter((s) => (from.x === to.x ? s.x === from.x : s.y === from.y))
      .filter((s) => Math.min(from.x, to.x) <= s.x && s.x <= Math.max(from.x, to.x))
      .filter((s) => Math.min(from.y, to.y) <= s.y && s.y <= Math.max(from.y, to.y))
      .sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y));

    const nodes = [from, ...onEdge, to];
    const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
    // 駅のない辺（角から角まで）には描かない
    if (onEdge.length === 0) return;
    for (let j = 0; j < nodes.length - 1; j++) {
      const a = nodes[j];
      const b = nodes[j + 1];
      if (Math.hypot(b.x - a.x, b.y - a.y) < ARROW_MIN_GAP) continue;
      arrows.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, angle });
    }
  });

  return arrows;
}

const ARROWS = computeArrows();

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

function CaseBubble({ bubble, marker }: { bubble: Bubble; marker: MapMarker }) {
  const { x, y, width, height, pointer } = bubble;
  const tabWidth = estimateTextWidth(marker.place, BUBBLE_PLACE_FONT_SIZE) + 12;
  const tabHeight = 13;
  // しっぽの付け根（吹き出しの右端の、先端と同じ高さ付近）
  const baseY = Math.min(Math.max(pointer.y, y + 12), y + height - 12);

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} fill="rgba(255, 255, 255, 0.06)" stroke="#ffffff" strokeWidth={1.6} />
      {/* しっぽ（右端の枠線を背景色で消してから、くの字を描く） */}
      <line x1={x + width} y1={baseY - 5} x2={x + width} y2={baseY + 5} stroke="var(--color-bg)" strokeWidth={2.4} />
      <polyline
        points={`${x + width},${baseY - 5} ${pointer.x},${pointer.y} ${x + width},${baseY + 5}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {/* 場所名のタブ */}
      <rect x={x + width / 2 - tabWidth / 2} y={y - tabHeight / 2} width={tabWidth} height={tabHeight} fill="#ffffff" />
      <text
        x={x + width / 2}
        y={y + BUBBLE_PLACE_FONT_SIZE * 0.36}
        textAnchor="middle"
        fontSize={BUBBLE_PLACE_FONT_SIZE}
        fontWeight={700}
        fill="var(--color-bg)"
      >
        {marker.place}
      </text>
    </g>
  );
}

export default function TramMap({ markers }: { markers: MapMarker[] }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="札幌市電の路線図"
    >
      <path d={ROUTE_PATH} fill="none" stroke={ROUTE_COLOR} strokeWidth={ROUTE_WIDTH} strokeLinejoin="round" />

      {ARROWS.map((arrow, i) => (
        <polygon
          key={i}
          points={`${ARROW_SIZE},0 ${-ARROW_SIZE},${-ARROW_SIZE} ${-ARROW_SIZE},${ARROW_SIZE}`}
          fill={ROUTE_COLOR}
          transform={`translate(${arrow.x} ${arrow.y}) rotate(${arrow.angle})`}
        />
      ))}

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

      {/* 事件のある駅：虫眼鏡・下線付きの駅名・吹き出し（押すと事件ページへ） */}
      {markers.map((marker) => {
        const station = allRouteStations.find((s) => s.key === marker.stationKey);
        if (!station) return null;

        const label = labelPosition(station, station.label, 19);
        const fontSize = TARGET_FONT_SIZE;
        const textWidth = estimateTextWidth(station.name, fontSize);
        const underlineStart =
          label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - textWidth : label.x - textWidth / 2;
        const baseline = station.label === "top" ? label.y : label.y + (fontSize - STATION_FONT_SIZE) * 0.35;

        return (
          <Link key={marker.stationKey} href={`/case/${marker.caseId}`} aria-label={`${station.name}の事件を調べる`}>
            <g style={{ cursor: "pointer" }}>
              <CaseBubble bubble={CASE_BUBBLES[marker.stationKey]} marker={marker} />
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
