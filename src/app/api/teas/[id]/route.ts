import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type TeaUpdate = Database["public"]["Tables"]["teas"]["Update"];

/** GET /api/teas/[id] — 차 상세 + 가이드 + 마신 기록 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: tea, error } = await supabase
    .from("teas")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !tea) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [{ data: guide }, { data: logs }] = await Promise.all([
    supabase.from("brewing_guides").select("*").eq("tea_id", id).maybeSingle(),
    supabase
      .from("tea_logs")
      .select("*")
      .eq("tea_id", id)
      .order("brewed_at", { ascending: false }),
  ]);

  // 표시용 signed URL
  let imageUrl: string | null = null;
  if (tea.image_url) {
    const { data: signed } = await supabase.storage
      .from("tea-images")
      .createSignedUrl(tea.image_url, 3600);
    imageUrl = signed?.signedUrl ?? null;
  }

  // 기록 사진도 signed URL로
  const signedLogs = await Promise.all(
    (logs ?? []).map(async (log) => {
      if (!log.photo_url) return log;
      const { data: s } = await supabase.storage
        .from("tea-images")
        .createSignedUrl(log.photo_url, 3600);
      return { ...log, photo_url: s?.signedUrl ?? null };
    }),
  );

  return NextResponse.json({
    tea: { ...tea, image_url: imageUrl, image_path: tea.image_url },
    guide: guide ?? null,
    logs: signedLogs,
  });
}

/** PATCH /api/teas/[id] — 차 정보/즐겨찾기 수정 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let patch: TeaUpdate;
  try {
    patch = (await request.json()) as TeaUpdate;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  // 임의 컬럼 주입 방지: 허용 필드만
  const allowed: TeaUpdate = {
    tea_name: patch.tea_name,
    tea_category: patch.tea_category,
    brand: patch.brand,
    origin: patch.origin,
    production_year: patch.production_year,
    leaf_shape: patch.leaf_shape,
    is_compressed: patch.is_compressed,
    brewing_tool: patch.brewing_tool,
    drinking_style: patch.drinking_style,
    user_memo: patch.user_memo,
    is_favorite: patch.is_favorite,
  };
  Object.keys(allowed).forEach(
    (k) =>
      allowed[k as keyof TeaUpdate] === undefined &&
      delete allowed[k as keyof TeaUpdate],
  );

  const { data, error } = await supabase
    .from("teas")
    .update(allowed)
    .eq("id", id)
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

/** DELETE /api/teas/[id] */
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

  // 연결된 사진(차 대표 이미지 + 기록 사진) Storage에서 삭제
  const [{ data: tea }, { data: logs }] = await Promise.all([
    supabase.from("teas").select("image_url").eq("id", id).single(),
    supabase.from("tea_logs").select("photo_url").eq("tea_id", id),
  ]);
  const paths = [
    tea?.image_url,
    ...(logs ?? []).map((l) => l.photo_url),
  ].filter((p): p is string => !!p);
  if (paths.length > 0) {
    await supabase.storage.from("tea-images").remove(paths);
  }

  const { error } = await supabase.from("teas").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
