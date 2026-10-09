// 【役割】運営用アカウント（admin）専用。参加者（admin 以外）が、どの手がかりをいつ入手したかの一覧を返す
// （GET /api/admin/progress）。設定メニューの ProgressViewer.tsx から呼ばれる。
// 手がかりを1つも入手していない参加者も、件数 0 として含める。

import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { ADMIN_LOGIN_ID, getSessionAdmin } from "@/lib/users";
import { findClueById } from "@/lib/clues";
import { mockCases } from "@/lib/cases";
import type { ParticipantProgress } from "@/lib/progress-types";

type Row = { login_id: string; clue_id: string | null; found_at: string | null };

export async function GET() {
  if (!(await getSessionAdmin())) {
    return NextResponse.json({ error: "この操作は運営用アカウントだけが使えます" }, { status: 403 });
  }

  const rows = (await getSql()`
    SELECT u.login_id, f.clue_id, f.found_at
    FROM users u LEFT JOIN found_clues f ON f.user_id = u.id
    WHERE u.login_id <> ${ADMIN_LOGIN_ID}
    ORDER BY f.found_at
  `) as Row[];

  const byUser = new Map<string, ParticipantProgress>();
  for (const row of rows) {
    const entry = byUser.get(row.login_id) ?? { loginId: row.login_id, clues: [] };
    byUser.set(row.login_id, entry);
    if (!row.clue_id || !row.found_at) continue;
    const clue = findClueById(row.clue_id);
    entry.clues.push({
      clueName: clue?.name ?? row.clue_id,
      caseTitle: mockCases.find((c) => c.stationKey === clue?.caseId)?.title ?? "",
      foundAt: new Date(row.found_at).toISOString(),
    });
  }

  // ID は数字の順（1, 2, …, 10）に並べる
  const participants = [...byUser.values()].sort((a, b) =>
    a.loginId.localeCompare(b.loginId, "ja", { numeric: true })
  );
  return NextResponse.json({ participants });
}
