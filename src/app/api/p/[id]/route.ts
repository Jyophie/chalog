import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/p/[id] — 공개 차 상세 (비로그인 포함, 읽기 전용) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: tea } = await admin
    .from("teas")
    .select("*")
    .eq("id", id)
    .eq("visibility", "public")
    .maybeSingle();
  if (!tea) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [{ data: guide }, { data: logs }, { data: profile }] =
    await Promise.all([
      admin.from("brewing_guides").select("*").eq("tea_id", id).maybeSingle(),
      admin
        .from("tea_logs")
        .select("*")
        .eq("tea_id", id)
        .eq("is_private", false)
        .order("brewed_at", { ascending: false }),
      admin
        .from("public_profiles")
        .select("id, display_name")
        .eq("id", tea.user_id)
        .maybeSingle(),
    ]);

  // 이미지 서명 (대표 + 기록 사진)
  let imageUrl: string | null = null;
  if (tea.image_url) {
    const { data: s } = await admin.storage
      .from("tea-images")
      .createSignedUrl(tea.image_url, 3600);
    imageUrl = s?.signedUrl ?? null;
  }
  const signedLogs = await Promise.all(
    (logs ?? []).map(async (log) => {
      if (!log.photo_url) return log;
      const { data: s } = await admin.storage
        .from("tea-images")
        .createSignedUrl(log.photo_url, 3600);
      return { ...log, photo_url: s?.signedUrl ?? null };
    }),
  );

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
      .eq("tea_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!like;
  }

  return NextResponse.json({
    tea: { ...tea, image_url: imageUrl },
    guide: guide ?? null,
    logs: signedLogs,
    author: profile?.display_name ?? null,
    liked_by_me: likedByMe,
    is_authed: !!user,
  });
}
