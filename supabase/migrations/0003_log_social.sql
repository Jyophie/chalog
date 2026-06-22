-- ════════════════════════════════════════════════════════════════
-- chalog 커뮤니티 v2 — 공유 단위를 "차"에서 "시음 기록(tea_logs)"으로
--   tea_logs.is_public · like_count · comment_count
--   likes/comments 를 log_id 기준으로 재정의
--   차(teas)는 아카이브 전용(항상 비공개), 공개는 기록 단위로만
--   Supabase SQL Editor에 통째로 붙여넣고 Run.
-- ════════════════════════════════════════════════════════════════

-- ── tea_logs: 공개 여부 + 카운터 ───────────────────────────────
alter table public.tea_logs
  add column if not exists is_public     boolean not null default false,
  add column if not exists like_count    integer not null default 0,
  add column if not exists comment_count integer not null default 0;

-- 0002의 is_private 는 더 이상 사용하지 않음
alter table public.tea_logs drop column if exists is_private;

create index if not exists tea_logs_public_created_idx
  on public.tea_logs (created_at desc) where is_public;

-- ── 차 단위 공개 정책/카운터 정리 (0002 롤백) ──────────────────
drop policy if exists "teas_select_public"   on public.teas;
drop policy if exists "guides_select_public" on public.brewing_guides;
drop policy if exists "logs_select_public"   on public.tea_logs;

-- 기존 likes/comments(tea_id 기준) 제거 → 트리거도 함께 사라짐
drop table if exists public.comments cascade;
drop table if exists public.likes cascade;
drop function if exists public.bump_like_count() cascade;
drop function if exists public.bump_comment_count() cascade;

-- teas 의 미사용 카운터/공개 컬럼 정리
alter table public.teas drop column if exists like_count;
alter table public.teas drop column if exists comment_count;
alter table public.teas drop column if exists visibility;
drop type if exists tea_visibility;

-- ════════════════════════════════════════════════════════════════
-- 좋아요 (기록 단위)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  log_id     uuid not null references public.tea_logs(id) on delete cascade,
  user_id    uuid not null references public.users(id)    on delete cascade,
  created_at timestamptz not null default now(),
  unique (log_id, user_id)
);
create index if not exists likes_log_idx  on public.likes(log_id);
create index if not exists likes_user_idx on public.likes(user_id);

-- ════════════════════════════════════════════════════════════════
-- 댓글 (기록 단위)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  log_id     uuid not null references public.tea_logs(id) on delete cascade,
  user_id    uuid not null references public.users(id)    on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_log_created_idx on public.comments(log_id, created_at desc);

-- ── 카운터 트리거 (SECURITY DEFINER) ───────────────────────────
create or replace function public.bump_log_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.tea_logs set like_count = like_count + 1 where id = new.log_id;
  elsif tg_op = 'DELETE' then
    update public.tea_logs set like_count = greatest(0, like_count - 1) where id = old.log_id;
  end if;
  return null;
end $$;

drop trigger if exists likes_count_trg on public.likes;
create trigger likes_count_trg
  after insert or delete on public.likes
  for each row execute function public.bump_log_like_count();

create or replace function public.bump_log_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.tea_logs set comment_count = comment_count + 1 where id = new.log_id;
  elsif tg_op = 'DELETE' then
    update public.tea_logs set comment_count = greatest(0, comment_count - 1) where id = old.log_id;
  end if;
  return null;
end $$;

drop trigger if exists comments_count_trg on public.comments;
create trigger comments_count_trg
  after insert or delete on public.comments
  for each row execute function public.bump_log_comment_count();

-- ════════════════════════════════════════════════════════════════
-- RLS — 공개 기록 + 기록 단위 좋아요/댓글
-- ════════════════════════════════════════════════════════════════

-- 공개 기록은 누구나 조회 (기존 "본인 전체" 정책에 OR로 더해짐)
drop policy if exists "logs_select_public" on public.tea_logs;
create policy "logs_select_public" on public.tea_logs
  for select using (is_public = true);

-- likes
alter table public.likes enable row level security;

drop policy if exists "likes_select_public" on public.likes;
create policy "likes_select_public" on public.likes
  for select using (
    exists (select 1 from public.tea_logs l where l.id = log_id and l.is_public)
  );

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.tea_logs l where l.id = log_id and l.is_public)
  );

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (user_id = auth.uid());

-- comments
alter table public.comments enable row level security;

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select using (
    exists (select 1 from public.tea_logs l where l.id = log_id and l.is_public)
  );

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.tea_logs l where l.id = log_id and l.is_public)
  );

-- 댓글 삭제: 본인 또는 해당 기록(차)의 주인
drop policy if exists "comments_delete_own_or_owner" on public.comments;
create policy "comments_delete_own_or_owner" on public.comments
  for delete using (
    user_id = auth.uid()
    or exists (
      select 1 from public.tea_logs l
      join public.teas t on t.id = l.tea_id
      where l.id = log_id and t.user_id = auth.uid()
    )
  );
