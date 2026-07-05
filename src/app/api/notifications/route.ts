import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/notifications — 내 알림 목록 + 안 읽은 수 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: notis } = await admin
    .from("notifications")
    .select("id, actor_id, type, log_id, comment_id, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  const list = notis ?? [];

  // 행위자 프로필
  const actorIds = [...new Set(list.map((n) => n.actor_id))];
  const { data: actors } = actorIds.length
    ? await admin
        .from("public_profiles")
        .select("id, display_name, avatar_url")
        .in("id", actorIds)
    : { data: [] };
  const actorById = new Map((actors ?? []).map((a) => [a.id, a]));

  // 기록 → 차 이름
  const logIds = [...new Set(list.map((n) => n.log_id))];
  const { data: logs } = logIds.length
    ? await admin.from("tea_logs").select("id, tea_id").in("id", logIds)
    : { data: [] };
  const teaIdByLog = new Map((logs ?? []).map((l) => [l.id, l.tea_id]));
  const teaIds = [...new Set((logs ?? []).map((l) => l.tea_id))];
  const { data: teas } = teaIds.length
    ? await admin.from("teas").select("id, tea_name").in("id", teaIds)
    : { data: [] };
  const teaNameById = new Map((teas ?? []).map((t) => [t.id, t.tea_name]));

  // 댓글 본문
  const commentIds = list
    .map((n) => n.comment_id)
    .filter((c): c is string => !!c);
  const { data: comments } = commentIds.length
    ? await admin.from("comments").select("id, body").in("id", commentIds)
    : { data: [] };
  const commentById = new Map((comments ?? []).map((c) => [c.id, c.body]));

  const items = list.map((n) => {
    const actor = actorById.get(n.actor_id);
    const teaId = teaIdByLog.get(n.log_id);
    return {
      id: n.id,
      type: n.type,
      read: n.read,
      created_at: n.created_at,
      log_id: n.log_id,
      actor: actor?.display_name ?? null,
      actor_avatar: actor?.avatar_url ?? null,
      tea_name: teaId ? (teaNameById.get(teaId) ?? null) : null,
      comment_body: n.comment_id
        ? (commentById.get(n.comment_id) ?? null)
        : null,
    };
  });

  const unread = list.filter((n) => !n.read).length;
  return NextResponse.json({ items, unread });
}

/** POST /api/notifications — 모두 읽음 처리 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  return NextResponse.json({ ok: true });
}
