import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/logs/[logId]/like — 좋아요 (공개 기록에 한해, RLS 검증) */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("likes")
    .upsert(
      { log_id: logId, user_id: user.id },
      { onConflict: "log_id,user_id", ignoreDuplicates: true },
    );
  if (error) return NextResponse.json({ error: "like failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/logs/[logId]/like — 좋아요 취소 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("log_id", logId)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "unlike failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
