import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** PATCH /api/logs/[logId] — 기록 공개 여부 토글 (본인만, RLS) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let isPublic: boolean;
  try {
    isPublic = !!((await request.json()) as { is_public?: boolean }).is_public;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { error } = await supabase
    .from("tea_logs")
    .update({ is_public: isPublic })
    .eq("id", logId)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "update failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
