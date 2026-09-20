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
        maxWidth: 420,
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
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: "var(--color-surface-alt)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  marginBottom: 8,
                }}
              >
                🧩
              </div>
              <h3 style={{ marginBottom: 6, fontSize: 16, textAlign: "center" }}>
                {slot.clue.name}
              </h3>
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
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: "var(--color-surface)",
                  border: "1px dashed var(--color-border)",
                  borderRadius: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  color: "var(--color-text-muted)",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 40 }}>？</span>
                <span style={{ fontSize: 12 }}>まだ見つかっていません</span>
              </div>
              <h3 style={{ color: "var(--color-text-muted)", fontSize: 16 }}>？</h3>
            </div>
          )
        )}
      </div>
    </main>
  );
}
