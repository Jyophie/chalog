import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type TeaInsert = Database["public"]["Tables"]["teas"]["Insert"];
type GuideInsert = Database["public"]["Tables"]["brewing_guides"]["Insert"];

/** GET /api/teas — 내 차 아카이브 목록 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 아카이브는 "내 차"만 — 공개 RLS 정책이 추가된 뒤로 user_id 필터 필수
  const { data, error } = await supabase
    .from("teas")
    .select("id, tea_name, tea_category, image_url, is_favorite, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 비공개 이미지 → 표시용 signed URL 일괄 변환
  const paths = (data ?? [])
    .map((t) => t.image_url)
    .filter((p): p is string => !!p);
  const signedMap = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await supabase.storage
      .from("tea-images")
      .createSignedUrls(paths, 3600);
    signed?.forEach((s) => {
      if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
    });
  }

  const teas = (data ?? []).map((t) => ({
    ...t,
    image_url: t.image_url ? (signedMap.get(t.image_url) ?? null) : null,
  }));
  return NextResponse.json({ teas });
}

/** POST /api/teas — 차 + 우리는 가이드 저장 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    tea?: Partial<TeaInsert>;
    guide?: Partial<GuideInsert>;
    imagePath?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const t = body.tea ?? {};
  const teaInsert: TeaInsert = {
    user_id: user.id,
    tea_name: t.tea_name ?? null,
    tea_category: t.tea_category ?? null,
    brand: t.brand ?? null,
    origin: t.origin ?? null,
    production_year: t.production_year ?? null,
    image_url: body.imagePath ?? t.image_url ?? null,
    leaf_shape: t.leaf_shape ?? null,
    is_compressed: t.is_compressed ?? false,
    brewing_tool: t.brewing_tool ?? null,
    drinking_style: t.drinking_style ?? null,
    user_memo: t.user_memo ?? null,
    ai_summary: t.ai_summary ?? null,
    confidence_level: t.confidence_level ?? null,
    extracted_text: t.extracted_text ?? null,
  };

  const { data: tea, error: teaErr } = await supabase
    .from("teas")
    .insert(teaInsert)
    .select("id")
    .single();
  if (teaErr || !tea) {
    return NextResponse.json(
      { error: teaErr?.message ?? "insert failed" },
      { status: 500 },
    );
  }

  if (body.guide) {
    const g = body.guide;
    const guideInsert: GuideInsert = {
      tea_id: tea.id,
      water_temperature: g.water_temperature ?? null,
      tea_amount: g.tea_amount ?? null,
      steeping_time: g.steeping_time ?? null,
      recommended_tool: g.recommended_tool ?? null,
      rinse_method: g.rinse_method ?? null,
      guide_text: g.guide_text ?? null,
      adjustment_tips: g.adjustment_tips ?? null,
    };
    const { error: guideErr } = await supabase
      .from("brewing_guides")
      .insert(guideInsert);
    if (guideErr) {
      // 가이드 저장 실패해도 차는 저장됨 — 경고만
      console.error("guide insert failed", guideErr);
    }
  }

  return NextResponse.json({ id: tea.id }, { status: 201 });
}
