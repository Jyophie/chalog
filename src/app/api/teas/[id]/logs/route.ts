import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { teaLogSchema } from "@/lib/schemas/tea";

/** POST /api/teas/[id]/logs — 마신 기록 추가 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: teaId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const parsed = teaLogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 사진 경로는 본인 폴더만 허용
  const photoPaths = parsed.data.photo_paths ?? [];
  const allPhotos = [
    ...photoPaths,
    ...(parsed.data.photo_url ? [parsed.data.photo_url] : []),
  ];
  if (allPhotos.some((p) => !p.startsWith(`${user.id}/`))) {
    return NextResponse.json({ error: "invalid photo" }, { status: 400 });
  }

  // 차 소유 확인 (RLS가 막지만 명확한 에러 위해)
  const { data: owned } = await supabase
    .from("teas")
    .select("id")
    .eq("id", teaId)
    .single();
  if (!owned) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("tea_logs")
    .insert({
      ...parsed.data,
      photo_paths: photoPaths,
      photo_url: parsed.data.photo_url ?? photoPaths[0] ?? null, // 대표 이미지
      tea_id: teaId,
      user_id: user.id,
    })
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json({ error: "insert failed" }, { status: 500 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
