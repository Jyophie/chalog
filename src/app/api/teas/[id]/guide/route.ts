import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateGuide, type GuideInput } from "@/lib/openai/analyze";

export const maxDuration = 60;

/** POST /api/teas/[id]/guide — 저장된 차 정보로 우리는 가이드 재생성 + 저장 */
export async function POST(
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

  const input: GuideInput = {
    tea_name: tea.tea_name,
    tea_category: tea.tea_category,
    brand: tea.brand,
    origin: tea.origin,
    production_year: tea.production_year,
    leaf_shape: tea.leaf_shape,
    is_compressed: tea.is_compressed,
    brewing_tool: tea.brewing_tool,
    drinking_style: tea.drinking_style,
    user_memo: tea.user_memo,
  };

  let guide;
  try {
    guide = await generateGuide(input);
  } catch (e) {
    console.error("regenerate-guide failed", e);
    return NextResponse.json({ error: "guide failed" }, { status: 502 });
  }

  const { error: upsertError } = await supabase
    .from("brewing_guides")
    .upsert({ tea_id: id, ...guide }, { onConflict: "tea_id" });
  if (upsertError) {
    return NextResponse.json({ error: "save failed" }, { status: 500 });
  }

  return NextResponse.json(guide);
}
