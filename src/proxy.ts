import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Next.js 16 proxy (구 middleware) — 매 요청 Supabase 세션 갱신 + 보호 경로 가드 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 아래를 제외한 모든 경로에서 실행:
     * - _next/static, _next/image (정적 자원)
     * - favicon.ico, 이미지 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
