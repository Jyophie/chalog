import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** POST /api/u/[id]/follow — 팔로우 */
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
  if (user.id === id)
    return NextResponse.json({ error: "self" }, { status: 400 });

  const { error } = await supabase
    .from("follows")
    .upsert(
      { follower_id: user.id, following_id: id },
      { onConflict: "follower_id,following_id", ignoreDuplicates: true },
    );
  if (error) return NextResponse.json({ error: "follow failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/u/[id]/follow — 언팔로우 */
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
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", id);
  if (error)
    return NextResponse.json({ error: "unfollow failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
