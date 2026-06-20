import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeTea } from "@/lib/openai/analyze";

export const maxDuration = 60;

/** POST /api/analyze-tea — 업로드된 이미지(Storage path) AI 1차 분석 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let imagePath: string | undefined;
  try {
    ({ imagePath } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!imagePath || typeof imagePath !== "string") {
    return NextResponse.json({ error: "imagePath required" }, { status: 400 });
  }
  // 본인 폴더 경로인지 방어
  if (!imagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from("tea-images")
    .createSignedUrl(imagePath, 120);
  if (signErr || !signed) {
    return NextResponse.json({ error: "image not found" }, { status: 404 });
  }

  try {
    const result = await analyzeTea(signed.signedUrl);
    return NextResponse.json(result);
  } catch (e) {
    console.error("analyze-tea failed", e);
    return NextResponse.json({ error: "analysis failed" }, { status: 502 });
  }
}
