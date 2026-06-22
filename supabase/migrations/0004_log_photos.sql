-- ════════════════════════════════════════════════════════════════
-- chalog — 시음 기록 다중 사진
--   tea_logs.photo_paths text[] (여러 장). 기존 photo_url 은 대표(cover)로 유지.
--   Supabase SQL Editor에 붙여넣고 Run. (재실행 안전)
-- ════════════════════════════════════════════════════════════════

alter table public.tea_logs
  add column if not exists photo_paths text[] not null default '{}';

-- 기존 단일 사진 기록을 배열로 이관 (photo_url 이 있는데 photo_paths 가 비어있으면)
update public.tea_logs
  set photo_paths = array[photo_url]
  where photo_url is not null
    and (photo_paths is null or array_length(photo_paths, 1) is null);
