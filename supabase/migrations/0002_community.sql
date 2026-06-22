-- ════════════════════════════════════════════════════════════════
-- chalog 커뮤니티 확장 (공개 피드 + 좋아요 + 댓글)
--   teas.visibility · tea_logs.is_private · likes · comments
--   public_profiles 뷰 · 카운터 · 공개 RLS 정책
--   Supabase SQL Editor에 통째로 붙여넣고 Run.
-- ════════════════════════════════════════════════════════════════

-- ── enum: 공개 범위 ────────────────────────────────────────────
do $$ begin
  create type tea_visibility as enum ('private', 'public');
exception when duplicate_object then null; end $$;

-- ── 컬럼 추가 ──────────────────────────────────────────────────
alter table public.teas
  add column if not exists visibility     tea_visibility not null default 'private',
  add column if not exists like_count      integer not null default 0,
  add column if not exists comment_count   integer not null default 0;

create index if not exists teas_public_created_idx
  on public.teas (created_at desc) where visibility = 'public';

-- 공개 차의 시음 기록 중 특정 기록만 숨길 수 있도록
alter table public.tea_logs
  add column if not exists is_private boolean not null default false;

-- ════════════════════════════════════════════════════════════════
-- 좋아요
-- ════════════════════════════════════════════════════════════════
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  tea_id     uuid not null references public.teas(id)  on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tea_id, user_id)
);
create index if not exists likes_tea_idx  on public.likes(tea_id);
create index if not exists likes_user_idx on public.likes(user_id);

-- ════════════════════════════════════════════════════════════════
-- 댓글
-- ════════════════════════════════════════════════════════════════
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  tea_id     uuid not null references public.teas(id)  on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists comments_tea_created_idx on public.comments(tea_id, created_at desc);

-- ════════════════════════════════════════════════════════════════
-- 카운터 트리거 (SECURITY DEFINER — 좋아요/댓글 작성자가 차 주인이
-- 아니어도 teas 카운터를 갱신할 수 있도록 RLS 우회)
-- ════════════════════════════════════════════════════════════════
create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.teas set like_count = like_count + 1 where id = new.tea_id;
  elsif tg_op = 'DELETE' then
    update public.teas set like_count = greatest(0, like_count - 1) where id = old.tea_id;
  end if;
  return null;
end $$;

drop trigger if exists likes_count_trg on public.likes;
create trigger likes_count_trg
  after insert or delete on public.likes
  for each row execute function public.bump_like_count();

create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.teas set comment_count = comment_count + 1 where id = new.tea_id;
  elsif tg_op = 'DELETE' then
    update public.teas set comment_count = greatest(0, comment_count - 1) where id = old.tea_id;
  end if;
  return null;
end $$;

drop trigger if exists comments_count_trg on public.comments;
create trigger comments_count_trg
  after insert or delete on public.comments
  for each row execute function public.bump_comment_count();

-- ════════════════════════════════════════════════════════════════
-- 공개 프로필 뷰 (작성자 표시용 — 이메일 등 민감정보 제외)
--   definer 권한으로 동작하여 users RLS를 우회하되, 안전 컬럼만 노출.
-- ════════════════════════════════════════════════════════════════
create or replace view public.public_profiles as
  select id, display_name from public.users;

grant select on public.public_profiles to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- RLS — 공개 콘텐츠 조회 정책 (기존 "본인 전체" 정책에 OR로 더해짐)
-- ════════════════════════════════════════════════════════════════

-- 공개 차는 누구나 조회
drop policy if exists "teas_select_public" on public.teas;
create policy "teas_select_public" on public.teas
  for select using (visibility = 'public');

-- 공개 차의 가이드는 누구나 조회
drop policy if exists "guides_select_public" on public.brewing_guides;
create policy "guides_select_public" on public.brewing_guides
  for select using (
    exists (select 1 from public.teas t
            where t.id = tea_id and t.visibility = 'public')
  );

-- 공개 차의 기록 중 비공개 표시되지 않은 것만 누구나 조회
drop policy if exists "logs_select_public" on public.tea_logs;
create policy "logs_select_public" on public.tea_logs
  for select using (
    is_private = false
    and exists (select 1 from public.teas t
                where t.id = tea_id and t.visibility = 'public')
  );

-- ── likes ──────────────────────────────────────────────────────
alter table public.likes enable row level security;

drop policy if exists "likes_select_public" on public.likes;
create policy "likes_select_public" on public.likes
  for select using (
    exists (select 1 from public.teas t
            where t.id = tea_id and t.visibility = 'public')
  );

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.teas t
                where t.id = tea_id and t.visibility = 'public')
  );

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete using (user_id = auth.uid());

-- ── comments ───────────────────────────────────────────────────
alter table public.comments enable row level security;

drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select using (
    exists (select 1 from public.teas t
            where t.id = tea_id and t.visibility = 'public')
  );

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.teas t
                where t.id = tea_id and t.visibility = 'public')
  );

-- 댓글 삭제: 본인 또는 해당 차의 주인
drop policy if exists "comments_delete_own_or_owner" on public.comments;
create policy "comments_delete_own_or_owner" on public.comments
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from public.teas t
               where t.id = tea_id and t.user_id = auth.uid())
  );
