-- ════════════════════════════════════════════════════════════════
-- chalog — 대댓글(comment replies) + 신고(reports)
--   Supabase SQL Editor에 붙여넣고 Run. (재실행 안전)
-- ════════════════════════════════════════════════════════════════

-- ── 대댓글: comments.parent_id (한 단계 스레드) ────────────────
alter table public.comments
  add column if not exists parent_id uuid
    references public.comments(id) on delete cascade;
create index if not exists comments_parent_idx on public.comments(parent_id);

-- ── 신고 ───────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('log', 'comment')),
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 1 and 500),
  created_at  timestamptz not null default now()
);
create index if not exists reports_target_idx
  on public.reports (target_type, target_id);

alter table public.reports enable row level security;

-- 로그인 사용자는 신고 생성만 가능 (조회/수정/삭제는 운영자 service role)
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (reporter_id = auth.uid());
