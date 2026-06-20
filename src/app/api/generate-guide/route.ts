import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateGuide, type GuideInput } from "@/lib/openai/analyze";

export const maxDuration = 60;

/** POST /api/generate-guide — 분석 결과 + 사용자 보정 → 우리는 가이드 생성 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: GuideInput;
  try {
    body = (await request.json()) as GuideInput;
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    const guide = await generateGuide(body);
    return NextResponse.json(guide);
  } catch (e) {
    console.error("generate-guide failed", e);
    return NextResponse.json({ error: "guide failed" }, { status: 502 });
  }
}
