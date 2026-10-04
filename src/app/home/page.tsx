// 【役割】ホーム画面（/home）。路線図と設定メニューを表示する。未ログインならログイン画面へ戻す。
//
// 【変更すると】
//  - 説明文（「路線図上の駅マーカーを押すと…」）… ホームの案内文が変わる
//  - main の height: "100dvh" … 画面の高さぴったりにして、路線図を残りの高さに収める（スクロールなしで全体が見える）
//  - main の padding / gap … 余白。小さくするほど路線図が大きく表示される
//  - 説明文の fontSize … 小さくするほど、縦の短い端末で路線図が大きく表示される
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
    };
  });

  return (
    <main
      style={{
        width: "100%",
        maxWidth: 420,
        height: "100dvh",
        margin: "0 auto",
        padding: "24px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>ホーム</h1>
        <AccountMenu loginId={user.loginId} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.6 }}>
        路線図上の駅マーカーを押すと、その付近で起きた事件の捜査がはじまります。
      </p>
      {/* 路線図はパネルに入れず、背景の上に直接描く。見出しと説明文の残りの高さいっぱいに表示する */}
      {/* 左右の余白を減らして路線図を横にも大きく見せる。左右の数値の差で左寄せの具合を決める
          （左を大きくするほど左に寄る。一番左の駅名が画面の端に付かない程度にする） */}
      <div style={{ flex: 1, minHeight: 0, margin: "0 -2px 0 -14px" }}>
        <TramMap markers={markers} />
      </div>
    </main>
  );
}
