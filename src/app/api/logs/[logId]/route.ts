import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { teaLogSchema } from "@/lib/schemas/tea";
import type { Database } from "@/lib/types/database";

type LogUpdate = Database["public"]["Tables"]["tea_logs"]["Update"];

const EDITABLE = [
  "brewed_at",
  "photo_paths",
  "water_temperature",
  "steeping_time",
  "tea_amount",
  "tool",
  "taste_memo",
  "aroma_memo",
  "bitterness_level",
  "astringency_level",
  "rating",
  "next_adjustment",
  "is_public",
] as const;

/** GET /api/logs/[logId] — 편집용 기록 조회 (본인만) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: log } = await supabase
    .from("tea_logs")
    .select("*")
    .eq("id", logId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!log) return NextResponse.json({ error: "not found" }, { status: 404 });

  const paths =
    log.photo_paths && log.photo_paths.length > 0
      ? log.photo_paths
      : log.photo_url
        ? [log.photo_url]
        : [];
  const photos: { path: string; url: string }[] = [];
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("tea-images")
      .createSignedUrls(paths, 3600);
    (signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) photos.push({ path: s.path, url: s.signedUrl });
    });
  }

  return NextResponse.json({ log, photos });
}

/** PATCH /api/logs/[logId] — 기록 수정 / 공개 토글 (본인만, 부분 업데이트) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // 보낸 필드만 골라 부분 검증
  const picked: Record<string, unknown> = {};
  for (const f of EDITABLE) if (f in body) picked[f] = body[f];
  const parsed = teaLogSchema.partial().safeParse(picked);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }
  const patch: LogUpdate = { ...parsed.data };

  // 사진 경로는 본인 폴더만, 대표 이미지 동기화
  if (Array.isArray(patch.photo_paths)) {
    const paths = patch.photo_paths;
    if (paths.some((p) => !p.startsWith(`${user.id}/`))) {
      return NextResponse.json({ error: "invalid photo" }, { status: 400 });
    }
    patch.photo_url = paths[0] ?? null;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const { error } = await supabase
    .from("tea_logs")
    .update(patch)
    .eq("id", logId)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "update failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

/** DELETE /api/logs/[logId] — 기록 삭제 (본인만, Storage 정리 + 좋아요/댓글 연쇄) */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ logId: string }> },
) {
  const { logId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: log } = await supabase
    .from("tea_logs")
    .select("photo_url, photo_paths")
    .eq("id", logId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!log) return NextResponse.json({ error: "not found" }, { status: 404 });

  const paths = [
    ...(log.photo_paths ?? []),
    ...(log.photo_url ? [log.photo_url] : []),
  ].filter((p, i, a) => p && a.indexOf(p) === i);
  if (paths.length > 0) {
    await supabase.storage.from("tea-images").remove(paths);
  }

  const { error } = await supabase
    .from("tea_logs")
    .delete()
    .eq("id", logId)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "delete failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
