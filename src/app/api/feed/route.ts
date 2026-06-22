import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE = 30;

/** GET /api/feed — 공개 시음 기록 피드 (비로그인 포함) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // created_at ISO

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  let q = admin
    .from("tea_logs")
    .select(
      "id, tea_id, brewed_at, photo_url, photo_paths, water_temperature, steeping_time, tea_amount, tool, taste_memo, aroma_memo, next_adjustment, rating, like_count, comment_count, created_at",
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(PAGE);
  if (cursor) q = q.lt("created_at", cursor);

  const { data: logs, error } = await q;
  if (error) {
    return NextResponse.json({ error: "feed failed" }, { status: 500 });
  }
  if (!logs || logs.length === 0) {
    return NextResponse.json({ items: [], nextCursor: null, is_authed: !!user });
  }

  // 기록의 차 정보 (이름/종류/대표 이미지/작성자)
  const teaIds = [...new Set(logs.map((l) => l.tea_id))];
  const { data: teas } = await admin
    .from("teas")
    .select("id, tea_name, tea_category, image_url, user_id")
    .in("id", teaIds);
  const teaById = new Map((teas ?? []).map((t) => [t.id, t]));

  const authorIds = [...new Set((teas ?? []).map((t) => t.user_id))];
  const { data: profiles } = authorIds.length
    ? await admin
        .from("public_profiles")
        .select("id, display_name")
        .in("id", authorIds)
    : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  // 이미지 서명 (기록 사진 여러 장 + 대표/차 이미지 폴백)
  const paths = [
    ...logs.flatMap((l) => l.photo_paths ?? []),
    ...logs.map((l) => l.photo_url),
    ...(teas ?? []).map((t) => t.image_url),
  ].filter((p): p is string => !!p);
  const signedByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await admin.storage
      .from("tea-images")
      .createSignedUrls([...new Set(paths)], 3600);
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
    });
  }
  const sign = (p: string | null) => (p ? (signedByPath.get(p) ?? null) : null);

  // 내가 좋아요한 기록
  const likedSet = new Set<string>();
  if (user) {
    const { data: likes } = await admin
      .from("likes")
      .select("log_id")
      .eq("user_id", user.id)
      .in(
        "log_id",
        logs.map((l) => l.id),
      );
    (likes ?? []).forEach((l) => likedSet.add(l.log_id));
  }

  const items = logs.map((l) => {
    const tea = teaById.get(l.tea_id);
    const sources =
      l.photo_paths && l.photo_paths.length > 0
        ? l.photo_paths
        : [l.photo_url ?? tea?.image_url ?? null];
    const images = sources
      .map(sign)
      .filter((u): u is string => !!u);
    return {
      id: l.id,
      tea_name: tea?.tea_name ?? null,
      tea_category: tea?.tea_category ?? null,
      author: tea ? (nameById.get(tea.user_id) ?? null) : null,
      author_id: tea?.user_id ?? null,
      brewed_at: l.brewed_at,
      images,
      water_temperature: l.water_temperature,
      steeping_time: l.steeping_time,
      tea_amount: l.tea_amount,
      tool: l.tool,
      taste_memo: l.taste_memo,
      aroma_memo: l.aroma_memo,
      next_adjustment: l.next_adjustment,
      rating: l.rating,
      like_count: l.like_count,
      comment_count: l.comment_count,
      liked_by_me: likedSet.has(l.id),
      created_at: l.created_at,
    };
  });

  const nextCursor =
    logs.length === PAGE ? logs[logs.length - 1].created_at : null;

  return NextResponse.json({ items, nextCursor, is_authed: !!user });
}
