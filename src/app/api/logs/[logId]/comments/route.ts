import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/logs/[logId]/comments — 공개 기록 댓글 목록 (비로그인 포함) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const admin = createAdminClient();

  const { data: log } = await admin
    .from("tea_logs")
    .select("id, is_public, tea_id")
    .eq("id", logId)
    .maybeSingle();
  if (!log || !log.is_public) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const { data: tea } = await admin
    .from("teas")
    .select("user_id")
    .eq("id", log.tea_id)
    .maybeSingle();

  const { data: comments } = await admin
    .from("comments")
    .select("id, body, created_at, user_id, parent_id")
    .eq("log_id", logId)
    .order("created_at", { ascending: true });

  const ids = [...new Set((comments ?? []).map((c) => c.user_id))];
  const { data: profiles } = ids.length
    ? await admin
        .from("public_profiles")
        .select("id, display_name, avatar_url")
        .in("id", ids)
    : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const avatarById = new Map((profiles ?? []).map((p) => [p.id, p.avatar_url]));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    comments: (comments ?? []).map((c) => ({
      id: c.id,
      body: c.body,
      created_at: c.created_at,
      user_id: c.user_id,
      parent_id: c.parent_id,
      author: nameById.get(c.user_id) ?? null,
      author_avatar: avatarById.get(c.user_id) ?? null,
    })),
    me: user?.id ?? null,
    is_owner: user ? tea?.user_id === user.id : false,
    is_authed: !!user,
  });
}

/** POST /api/logs/[logId]/comments — 댓글 작성 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: string;
  let parentId: string | null = null;
  try {
    const json = (await request.json()) as { body?: string; parent_id?: string };
    body = String(json.body ?? "").trim();
    parentId = json.parent_id ? String(json.parent_id) : null;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (body.length < 1 || body.length > 1000) {
    return NextResponse.json({ error: "댓글을 확인해주세요." }, { status: 400 });
  }

  // 대댓글: 부모가 같은 기록의 최상위 댓글이어야 함 (한 단계만)
  if (parentId) {
    const { data: parent } = await supabase
      .from("comments")
      .select("id, log_id, parent_id")
      .eq("id", parentId)
      .maybeSingle();
    if (!parent || parent.log_id !== logId || parent.parent_id) {
      return NextResponse.json({ error: "invalid parent" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ log_id: logId, user_id: user.id, body, parent_id: parentId })
    .select("id")
    .single();
  if (error || !data) {
    return NextResponse.json({ error: "comment failed" }, { status: 400 });
  }
  return NextResponse.json({ id: data.id }, { status: 201 });
}
