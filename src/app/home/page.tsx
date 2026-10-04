// 【役割】ホーム画面（/home）。路線図と設定メニューを表示する。未ログインならログイン画面へ戻す。
//
// 【変更すると】
//  - 説明文（「路線図上の駅マーカーを押すと…」）… ホームの案内文が変わる
//  - 路線図の場所名 … cases.ts の place
//  - 駅の位置 … stations.ts、路線図の描き方 … TramMap.tsx
//
// 【注意】対象駅（stations.ts の targetStationKeys）に事件（cases.ts）がないとエラーで表示できなくなる。

import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { targetStationKeys } from "@/lib/stations";
import { mockCases } from "@/lib/cases";
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

  const markers: MapMarker[] = targetStationKeys.map((stationKey) => {
    const caseInfo = mockCases.find((c) => c.stationKey === stationKey);
    if (!caseInfo) {
      throw new Error(`事件データが見つかりません: ${stationKey}`);
    }

    return {
      stationKey,
      caseId: caseInfo.id,
      place: caseInfo.place,
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
      {/* 路線図はパネルに入れず、背景の上に直接描く */}
      <TramMap markers={markers} />
    </main>
  );
}
