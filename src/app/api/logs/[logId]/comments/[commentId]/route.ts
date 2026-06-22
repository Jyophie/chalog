import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** DELETE /api/logs/[logId]/comments/[commentId] — 댓글 삭제 (본인/기록 주인, RLS) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ logId: string; commentId: string }> },
) {
  const { commentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return NextResponse.json({ error: "delete failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
