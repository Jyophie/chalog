import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** DELETE /api/teas/[id]/comments/[commentId] — 댓글 삭제 (본인 또는 차 주인, RLS) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { commentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // RLS가 본인/차 주인만 삭제 허용 — 권한 없으면 0행 삭제(에러 아님)
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return NextResponse.json({ error: "delete failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
