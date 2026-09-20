import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { mockCases } from "@/lib/cases";
import { getClueSlotsForCase } from "@/lib/clues";
import { ChevronLeftIcon } from "@/components/icons";
import ClueGrid from "./ClueGrid";
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

  const slots = getClueSlotsForCase(caseInfo.stationKey, caseInfo.clueSlots);

  return (
    <main
      style={{
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

      <ClueGrid slots={slots} />

      <SolveTools />
    </main>
  );
}
