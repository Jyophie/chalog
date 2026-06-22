import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/teas/[id]/like — 좋아요 (공개 차에 한해, RLS로 검증) */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("likes")
    .upsert(
      { tea_id: id, user_id: user.id },
      { onConflict: "tea_id,user_id", ignoreDuplicates: true },
    );
  if (error) return NextResponse.json({ error: "like failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/teas/[id]/like — 좋아요 취소 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("tea_id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "unlike failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
