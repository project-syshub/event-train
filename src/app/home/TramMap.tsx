import Link from "next/link";
import { allRouteStations, targetStationKeys, VIEW_WIDTH, VIEW_HEIGHT } from "@/lib/stations";

export type MapMarker = {
  key: string;
  name: string;
  x: number;
  y: number;
  caseId: string;
  color: string;
};

// 全駅を順番につないだ折れ線（実際の市電ループ線の形状を近似）
const ROUTE_PATH =
  allRouteStations.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`).join(" ") + " Z";

// 対象駅以外は、路線図上の目印として小さな点のみ表示する
const otherStations = allRouteStations.filter(
  (s) => !(targetStationKeys as string[]).includes(s.key)
);

export default function TramMap({ markers }: { markers: MapMarker[] }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: VIEW_WIDTH }}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#c9a97a"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {otherStations.map((station) => (
          <circle
            key={station.key}
            cx={station.x}
            cy={station.y}
            r={3}
            fill="#8a6239"
            stroke="#c9a97a"
            strokeWidth={1}
          >
            <title>{station.name}</title>
          </circle>
        ))}

        {markers.map((marker) => (
          <Link key={marker.key} href={`/case/${marker.caseId}`} aria-label={marker.name}>
            <circle
              cx={marker.x}
              cy={marker.y}
              r={8}
              fill={marker.color}
              stroke="#f5ead8"
              strokeWidth={2}
              style={{ cursor: "pointer" }}
            >
              <title>{marker.name}</title>
            </circle>
          </Link>
        ))}
      </svg>

      {markers.map((marker) => (
        <Link
          key={marker.key}
          href={`/case/${marker.caseId}`}
          style={{
            position: "absolute",
            left: `${(marker.x / VIEW_WIDTH) * 100}%`,
            top: `${(marker.y / VIEW_HEIGHT) * 100}%`,
            transform: "translate(-50%, 24px)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text)",
            whiteSpace: "nowrap",
          }}
        >
          {marker.name}
        </Link>
      ))}
    </div>
  );
}
