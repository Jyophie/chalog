import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TYPES = ["log", "comment"] as const;

/** POST /api/reports — 공개 기록·댓글 신고 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let payload: { target_type?: string; target_id?: string; reason?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const targetType = payload.target_type;
  const targetId = String(payload.target_id ?? "");
  const reason = String(payload.reason ?? "").trim();

  if (!TYPES.includes(targetType as (typeof TYPES)[number]) || !targetId) {
    return NextResponse.json({ error: "invalid target" }, { status: 400 });
  }
  if (reason.length < 1 || reason.length > 500) {
    return NextResponse.json({ error: "사유를 확인해주세요." }, { status: 400 });
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType as "log" | "comment",
    target_id: targetId,
    reason,
  });
  if (error) {
    return NextResponse.json({ error: "report failed" }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
