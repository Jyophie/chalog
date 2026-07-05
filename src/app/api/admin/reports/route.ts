import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

/** GET /api/admin/reports — 신고 목록 (운영자 전용) */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select("id, target_type, target_id, reason, reporter_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const list = reports ?? [];

  const logIds = list
    .filter((r) => r.target_type === "log")
    .map((r) => r.target_id);
  const commentIds = list
    .filter((r) => r.target_type === "comment")
    .map((r) => r.target_id);

  const { data: logs } = logIds.length
    ? await admin
        .from("tea_logs")
        .select("id, tea_id, is_public, user_id")
        .in("id", logIds)
    : { data: [] };
  const logById = new Map((logs ?? []).map((l) => [l.id, l]));
  const teaIds = [...new Set((logs ?? []).map((l) => l.tea_id))];
  const { data: teas } = teaIds.length
    ? await admin.from("teas").select("id, tea_name").in("id", teaIds)
    : { data: [] };
  const teaNameById = new Map((teas ?? []).map((t) => [t.id, t.tea_name]));

  const { data: comments } = commentIds.length
    ? await admin.from("comments").select("id, body, log_id").in("id", commentIds)
    : { data: [] };
  const commentById = new Map((comments ?? []).map((c) => [c.id, c]));

  const reporterIds = [...new Set(list.map((r) => r.reporter_id))];
  const { data: reporters } = reporterIds.length
    ? await admin
        .from("public_profiles")
        .select("id, display_name")
        .in("id", reporterIds)
    : { data: [] };
  const reporterById = new Map(
    (reporters ?? []).map((p) => [p.id, p.display_name]),
  );

  const items = list.map((r) => {
    const log = r.target_type === "log" ? logById.get(r.target_id) : null;
    const comment =
      r.target_type === "comment" ? commentById.get(r.target_id) : null;
    return {
      id: r.id,
      target_type: r.target_type,
      target_id: r.target_id,
      reason: r.reason,
      created_at: r.created_at,
      reporter: reporterById.get(r.reporter_id) ?? null,
      log_id: log ? log.id : (comment?.log_id ?? null),
      is_public: log ? log.is_public : null,
      tea_name: log ? (teaNameById.get(log.tea_id) ?? null) : null,
      comment_body: comment?.body ?? null,
      exists: !!log || !!comment,
    };
  });

  return NextResponse.json({ items });
}

/** POST /api/admin/reports — 신고 처리 (운영자 전용) */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { report_id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const reportId = String(body.report_id ?? "");
  const action = body.action;
  if (!reportId || !["hide", "dismiss"].includes(action ?? "")) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: report } = await admin
    .from("reports")
    .select("target_type, target_id")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (action === "hide") {
    if (report.target_type === "log") {
      // 기록 비공개 처리 (소유자는 볼 수 있음)
      await admin
        .from("tea_logs")
        .update({ is_public: false })
        .eq("id", report.target_id);
    } else {
      // 댓글 삭제
      await admin.from("comments").delete().eq("id", report.target_id);
    }
  }

  // 처리(또는 무시) 후 신고 제거
  await admin.from("reports").delete().eq("id", reportId);
  return NextResponse.json({ ok: true });
}
