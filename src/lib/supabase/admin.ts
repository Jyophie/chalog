import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * service role 클라이언트 — RLS를 우회한다.
 * 공개 콘텐츠 조회(비로그인 + 타인 사진 서명)에만 사용하며,
 * 반드시 visibility='public' 등 조건을 쿼리에서 명시적으로 건다.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
