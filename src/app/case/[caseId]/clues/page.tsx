import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUserId } from "@/lib/session";
import { mockCases } from "@/lib/cases";
import { getClueSlotsForCase } from "@/lib/clues";

export default async function CluesPage({
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

  const slots = getClueSlotsForCase(caseInfo.stationKey);

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "40px auto",
        padding: "0 16px 40px",
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Link href={`/case/${caseId}`}>
        <button>← {caseInfo.title}に戻る</button>
      </Link>

      <h1>🧩 手がかり一覧</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {slots.map((slot, index) =>
          slot.found ? (
            <div
              key={slot.clue.id}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: 14,
              }}
            >
              <h3 style={{ marginBottom: 6, fontSize: 16 }}>{slot.clue.name}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5 }}>{slot.clue.description}</p>
            </div>
          ) : (
            <div
              key={`unknown-${index}`}
              style={{
                background: "var(--color-surface-alt)",
                border: "1px dashed var(--color-border)",
                borderRadius: 8,
                padding: 14,
                textAlign: "center",
              }}
            >
              <h3 style={{ color: "var(--color-text-muted)" }}>？</h3>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                まだ見つかっていない手がかりです
              </p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
