import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE = 30;

/** GET /api/feed — 공개 차 피드 (비로그인 포함) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // created_at ISO

  // 현재 사용자(있으면) — 내가 좋아요했는지 표시용
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  let q = admin
    .from("teas")
    .select(
      "id, tea_name, tea_category, origin, image_url, like_count, comment_count, created_at, user_id",
    )
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(PAGE);
  if (cursor) q = q.lt("created_at", cursor);

  const { data: teas, error } = await q;
  if (error) {
    return NextResponse.json({ error: "feed failed" }, { status: 500 });
  }
  if (!teas || teas.length === 0) {
    return NextResponse.json({ items: [], nextCursor: null, is_authed: !!user });
  }

  // 작성자 닉네임
  const authorIds = [...new Set(teas.map((t) => t.user_id))];
  const { data: profiles } = await admin
    .from("public_profiles")
    .select("id, display_name")
    .in("id", authorIds);
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  // 이미지 일괄 서명
  const paths = teas
    .map((t) => t.image_url)
    .filter((p): p is string => !!p);
  const signedByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await admin.storage
      .from("tea-images")
      .createSignedUrls(paths, 3600);
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
    });
  }

  // 내가 좋아요한 차
  const likedSet = new Set<string>();
  if (user) {
    const { data: likes } = await admin
      .from("likes")
      .select("tea_id")
      .eq("user_id", user.id)
      .in(
        "tea_id",
        teas.map((t) => t.id),
      );
    (likes ?? []).forEach((l) => likedSet.add(l.tea_id));
  }

  const items = teas.map((t) => ({
    id: t.id,
    tea_name: t.tea_name,
    tea_category: t.tea_category,
    origin: t.origin,
    image_url: t.image_url ? (signedByPath.get(t.image_url) ?? null) : null,
    author: nameById.get(t.user_id) ?? null,
    like_count: t.like_count,
    comment_count: t.comment_count,
    liked_by_me: likedSet.has(t.id),
    created_at: t.created_at,
  }));

  const nextCursor =
    teas.length === PAGE ? teas[teas.length - 1].created_at : null;

  return NextResponse.json({ items, nextCursor, is_authed: !!user });
}
