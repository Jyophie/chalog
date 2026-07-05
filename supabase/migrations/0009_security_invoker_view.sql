-- ════════════════════════════════════════════════════════════════
-- chalog — public_profiles 뷰를 SECURITY INVOKER 로 (Supabase 린터 CRITICAL 해소)
--   뷰 조회 시 하위 users 테이블의 RLS를 "조회자" 기준으로 적용.
--   앱의 공개 프로필 읽기는 전부 service-role(admin)이라 동작 영향 없음
--   (service-role은 RLS 우회). anon 직접 조회 시엔 본인 행만 → 더 안전.
--   Supabase SQL Editor에 붙여넣고 Run. (재실행 안전)
-- ════════════════════════════════════════════════════════════════

alter view public.public_profiles set (security_invoker = on);
