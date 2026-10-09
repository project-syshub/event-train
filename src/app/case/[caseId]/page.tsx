// 【役割】事件ページ（/case/<事件のid>）。事件名・手がかり一覧・右下の虫眼鏡ボタンを表示する。
//
// 【変更すると】
//  - 「すべての手がかりを見つけよう！」… 見出しの下の案内文
//  - main の maxWidth … ページの最大幅（PCで開いたときの横幅）
//  - 事件名や手がかりの枠の数は cases.ts、手がかりの中身は clues.ts で変える
//
// URLに ?found=<手がかりのid> が付いていると、その手がかりの詳細ポップアップを開いた状態で表示する
// （虫眼鏡で手がかりを読み取ったあとに使う）

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { isCaseUnlocked, mockCases } from "@/lib/cases";
import { getClueSlotsForCase } from "@/lib/clues";
import { getFoundClueIds } from "@/lib/progress";
import { ChevronLeftIcon } from "@/components/icons";
import ClueGrid from "./ClueGrid";
import SolveTools from "./SolveTools";
import MessageInbox from "@/components/MessageInbox";
import { findUserById, isAdmin } from "@/lib/users";

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>;
  searchParams: Promise<{ found?: string | string[] }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const { caseId } = await params;
  const caseInfo = mockCases.find((c) => c.id === caseId);
  if (!caseInfo) {
    notFound();
  }

  const user = await findUserById(userId);
  const foundClueIds = await getFoundClueIds(userId);
  // 隠し事件（ループ事件など）は、出現するまでページを開けない
  if (!isCaseUnlocked(caseInfo, foundClueIds)) {
    notFound();
  }
  const slots = getClueSlotsForCase(caseInfo.stationKey, caseInfo.clueSlots, foundClueIds);
  const { found } = await searchParams;
  const openClueId = typeof found === "string" ? found : undefined;

  return (
    <main
      style={{
        // body が flex のため、width を指定しないと事件名の長さで横幅が変わってしまう
        width: "100%",
        maxWidth: 420,
        margin: "24px auto",
        padding: "0 16px 96px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div>
        <Link href="/home">
          <button className="button-secondary">
            <ChevronLeftIcon />
            ホームにもどる
          </button>
        </Link>
      </div>

      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
        <h1 style={{ fontSize: 26 }}>{caseInfo.title}</h1>
        <p style={{ fontSize: 15 }}>すべての手がかりを見つけよう！</p>
      </div>

      <ClueGrid slots={slots} openClueId={openClueId} />

      <SolveTools caseId={caseInfo.stationKey} />

      {/* 運営からの一斉メッセージ（参加者だけに表示） */}
      <MessageInbox enabled={!(user && isAdmin(user))} />
    </main>
  );
}
