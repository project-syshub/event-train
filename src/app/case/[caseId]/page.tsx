import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { mockCases, statusColor, statusLabel } from "@/lib/cases";
import SolveTools from "./SolveTools";

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
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

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: "0 16px 96px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Link href="/home">
        <button>← ホームに戻る</button>
      </Link>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1>{caseInfo.title}</h1>
        <p style={{ fontWeight: "bold", fontSize: 18, color: statusColor[caseInfo.status] }}>
          ステータス: {statusLabel[caseInfo.status]}
        </p>
        <p style={{ fontSize: 17, lineHeight: 1.7 }}>{caseInfo.summary}</p>
        <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
          （事件の詳細本文・捜査コンテンツは今後の設計対象です）
        </p>
      </div>

      <SolveTools caseId={caseId} />
    </main>
  );
}
