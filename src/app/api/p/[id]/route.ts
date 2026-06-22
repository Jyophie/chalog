import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/p/[id] — 공개 시음 기록 상세 (id = log id, 비로그인 포함) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: log } = await admin
    .from("tea_logs")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();
  if (!log) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [{ data: tea }, { data: profileWrap }] = await Promise.all([
    admin
      .from("teas")
      .select("id, tea_name, tea_category, brand, origin, production_year, image_url, user_id")
      .eq("id", log.tea_id)
      .maybeSingle(),
    admin
      .from("teas")
      .select("user_id")
      .eq("id", log.tea_id)
      .maybeSingle(),
  ]);

  const { data: profile } = profileWrap
    ? await admin
        .from("public_profiles")
        .select("id, display_name, avatar_url")
        .eq("id", profileWrap.user_id)
        .maybeSingle()
    : { data: null };

  // 이미지 서명 (기록 사진 여러 장 + 차 대표 이미지)
  async function sign(path: string | null) {
    if (!path) return null;
    const { data } = await admin.storage
      .from("tea-images")
      .createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  }
  const photoSources =
    log.photo_paths && log.photo_paths.length > 0
      ? log.photo_paths
      : log.photo_url
        ? [log.photo_url]
        : [];
  const [images, teaImage] = await Promise.all([
    Promise.all(photoSources.map(sign)).then((arr) =>
      arr.filter((u): u is string => !!u),
    ),
    sign(tea?.image_url ?? null),
  ]);

  // 내가 좋아요했는지
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let likedByMe = false;
  if (user) {
    const { data: like } = await admin
      .from("likes")
      .select("id")
      .eq("log_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!like;
  }

  return NextResponse.json({
    log: { ...log, images },
    tea: tea ? { ...tea, image_url: teaImage } : null,
    author: profile?.display_name ?? null,
    author_avatar: profile?.avatar_url ?? null,
    liked_by_me: likedByMe,
    is_owner: !!user && user.id === tea?.user_id,
    is_authed: !!user,
  });
}
