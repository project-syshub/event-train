"use client";

import { useState } from "react";
import Link from "next/link";
import type { CaseStatus } from "@/lib/cases";
import { CloseIcon } from "@/components/icons";
import { allRouteStations, targetStationKeys, VIEW_WIDTH, VIEW_HEIGHT } from "@/lib/stations";

export type MapMarker = {
  key: string;
  name: string;
  x: number;
  y: number;
  caseId: string;
  title: string;
  status: CaseStatus;
  statusLabel: string;
  color: string;
  summary: string;
};

// 全駅を順番につないだ折れ線（実際の市電ループ線の形状を近似）
const ROUTE_PATH =
  allRouteStations.map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`).join(" ") + " Z";

// 対象4駅以外は、路線図上の目印として小さな点のみ表示する
const otherStations = allRouteStations.filter(
  (s) => !(targetStationKeys as string[]).includes(s.key)
);

export default function TramMap({ markers }: { markers: MapMarker[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = markers.find((marker) => marker.key === selectedKey) ?? null;

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
          <circle
            key={marker.key}
            cx={marker.x}
            cy={marker.y}
            r={8}
            fill={marker.color}
            stroke="#f5ead8"
            strokeWidth={2}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedKey(marker.key)}
          >
            <title>{marker.name}</title>
          </circle>
        ))}
      </svg>

      {markers.map((marker) => (
        <div
          key={marker.key}
          style={{
            position: "absolute",
            left: `${(marker.x / VIEW_WIDTH) * 100}%`,
            top: `${(marker.y / VIEW_HEIGHT) * 100}%`,
            transform: "translate(-50%, 24px)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {marker.name}
        </div>
      ))}

      {selected && (
        <div
          style={{
            position: "absolute",
            left: `${(selected.x / VIEW_WIDTH) * 100}%`,
            top: `${(selected.y / VIEW_HEIGHT) * 100}%`,
            transform: "translate(-50%, calc(-100% - 16px))",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            padding: 16,
            width: 220,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 17 }}>{selected.title}</h3>
            <button
              className="icon-button"
              onClick={() => setSelectedKey(null)}
              aria-label="閉じる"
              style={{ width: 28, height: 28, flexShrink: 0, boxShadow: "none" }}
            >
              <CloseIcon size={14} />
            </button>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 15, color: selected.color, fontWeight: "bold" }}>
            {selected.statusLabel}
          </p>
          <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.6 }}>{selected.summary}</p>
          <Link href={`/case/${selected.caseId}`} style={{ display: "block" }}>
            <button style={{ width: "100%" }}>解決する</button>
          </Link>
        </div>
      )}
    </div>
  );
}
