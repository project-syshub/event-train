import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { stations } from "@/lib/stations";
import { mockCases, statusColor, statusLabel } from "@/lib/cases";
import TramMap, { type MapMarker } from "./TramMap";
import LogoutButton from "./LogoutButton";

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const markers: MapMarker[] = stations.map((station) => {
    const caseInfo = mockCases.find((c) => c.stationKey === station.key);
    if (!caseInfo) {
      throw new Error(`事件データが見つかりません: ${station.key}`);
    }

    return {
      key: station.key,
      name: station.name,
      x: station.x,
      y: station.y,
      caseId: caseInfo.id,
      title: caseInfo.title,
      status: caseInfo.status,
      statusLabel: statusLabel[caseInfo.status],
      color: statusColor[caseInfo.status],
      summary: caseInfo.summary,
    };
  });

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: "0 16px 40px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>ホーム</h1>
        <LogoutButton />
      </div>
      <p style={{ fontSize: 17, fontWeight: 600, color: "var(--color-bg-edge)", lineHeight: 1.7 }}>
        路線図上の駅マーカーをクリックすると、その付近で起きた事件の情報が表示されます。
      </p>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "20px 24px 44px",
        }}
      >
        <TramMap markers={markers} />
      </div>
    </main>
  );
}
