import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/u/[id] — 작성자 공개 프로필 (id = user id, 비로그인 포함) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: profile }, { data: logs }] = await Promise.all([
    admin
      .from("public_profiles")
      .select("id, display_name, avatar_url")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("tea_logs")
      .select(
        "id, tea_id, photo_url, photo_paths, rating, like_count, comment_count, created_at",
      )
      .eq("user_id", id)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const list = logs ?? [];

  // 차 이름/종류
  const teaIds = [...new Set(list.map((l) => l.tea_id))];
  const { data: teas } = teaIds.length
    ? await admin.from("teas").select("id, tea_name, tea_category").in("id", teaIds)
    : { data: [] };
  const teaById = new Map((teas ?? []).map((t) => [t.id, t]));

  // 대표 이미지 서명
  const covers = list
    .map((l) => l.photo_paths?.[0] ?? l.photo_url ?? null)
    .filter((p): p is string => !!p);
  const signedByPath = new Map<string, string>();
  if (covers.length > 0) {
    const { data: signed } = await admin.storage
      .from("tea-images")
      .createSignedUrls([...new Set(covers)], 3600);
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
    });
  }

  const items = list.map((l) => {
    const tea = teaById.get(l.tea_id);
    const coverPath = l.photo_paths?.[0] ?? l.photo_url ?? null;
    return {
      id: l.id,
      tea_name: tea?.tea_name ?? null,
      tea_category: tea?.tea_category ?? null,
      cover: coverPath ? (signedByPath.get(coverPath) ?? null) : null,
      photo_count: l.photo_paths?.length || (l.photo_url ? 1 : 0),
      rating: l.rating,
      like_count: l.like_count,
      comment_count: l.comment_count,
      created_at: l.created_at,
    };
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 팔로워/팔로잉 수 + 내 팔로우 여부
  const [{ count: followerCount }, { count: followingCount }] =
    await Promise.all([
      admin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id),
      admin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id),
    ]);
  let isFollowing = false;
  if (user && user.id !== id) {
    const { data: f } = await admin
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", id)
      .maybeSingle();
    isFollowing = !!f;
  }

  return NextResponse.json({
    author: profile?.display_name ?? null,
    avatar: profile?.avatar_url ?? null,
    items,
    count: items.length,
    follower_count: followerCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: isFollowing,
    is_me: !!user && user.id === id,
    is_authed: !!user,
  });
}
