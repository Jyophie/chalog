import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** 이메일 확인 / OAuth 로그인 후 code → 세션 교환 */
export async function GET(request: Request) {
  const { searchParams, origin: urlOrigin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

  // Vercel 프록시 뒤에서는 request.url 호스트가 내부 주소일 수 있어 forwarded 헤더 우선
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (fwdHost ? `${fwdProto}://${fwdHost}` : urlOrigin);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
