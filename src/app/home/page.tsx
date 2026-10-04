// 【役割】ホーム画面（/home）。路線図と設定メニューを表示する。未ログインならログイン画面へ戻す。
//
// 【変更すると】
//  - 説明文（「路線図上の駅マーカーを押すと…」）… ホームの案内文が変わる
//  - マーカーの色 … cases.ts の status / statusColor で決まる
//  - 駅の位置 … stations.ts、路線図の描き方 … TramMap.tsx
//
// 【注意】対象駅（stations.ts の targetStationKeys）に事件（cases.ts）がないとエラーで表示できなくなる。

import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { stations } from "@/lib/stations";
import { mockCases, statusColor } from "@/lib/cases";
import TramMap, { type MapMarker } from "./TramMap";
import AccountMenu from "./AccountMenu";

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = findUserById(userId);
  if (!user) {
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
      color: statusColor[caseInfo.status],
    };
  });

  return (
    <main
      style={{
        maxWidth: 420,
        margin: "40px auto",
        padding: "0 16px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>ホーム</h1>
        <AccountMenu loginId={user.loginId} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.7 }}>
        路線図上の駅マーカーを押すと、その付近で起きた事件の捜査がはじまります。
      </p>
      <div
        className="surface-panel"
        style={{
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
