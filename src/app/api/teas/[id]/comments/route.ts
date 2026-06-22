import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/teas/[id]/comments — 공개 차 댓글 목록 (비로그인 포함) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: tea } = await admin
    .from("teas")
    .select("user_id, visibility")
    .eq("id", id)
    .maybeSingle();
  if (!tea || tea.visibility !== "public") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { data: comments } = await admin
    .from("comments")
    .select("id, body, created_at, user_id")
    .eq("tea_id", id)
    .order("created_at", { ascending: true });

  const ids = [...new Set((comments ?? []).map((c) => c.user_id))];
  const { data: profiles } = ids.length
    ? await admin.from("public_profiles").select("id, display_name").in("id", ids)
    : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    comments: (comments ?? []).map((c) => ({
      ...c,
      author: nameById.get(c.user_id) ?? null,
    })),
    me: user?.id ?? null,
    is_owner: user ? tea.user_id === user.id : false,
    is_authed: !!user,
  });
}

/** POST /api/teas/[id]/comments — 댓글 작성 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: string;
  try {
    body = String(((await request.json()) as { body?: string }).body ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (body.length < 1 || body.length > 1000) {
    return NextResponse.json({ error: "댓글을 확인해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ tea_id: id, user_id: user.id, body })
    .select("id")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "comment failed" }, { status: 400 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
