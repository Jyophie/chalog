-- ════════════════════════════════════════════════════════════════
-- chalog — 팔로우(follows) + 팔로우 알림
--   Supabase SQL Editor에 붙여넣고 Run. (재실행 안전)
-- ════════════════════════════════════════════════════════════════

create table if not exists public.follows (
  follower_id  uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);
create index if not exists follows_follower_idx on public.follows (follower_id);

alter table public.follows enable row level security;

-- 팔로우 그래프는 공개(카운트/목록 조회), 생성/삭제는 본인만
drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all" on public.follows for select using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows
  for insert with check (follower_id = auth.uid());

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows
  for delete using (follower_id = auth.uid());

-- ── 알림에 'follow' 타입 추가 (log 없음) ───────────────────────
alter table public.notifications alter column log_id drop not null;
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('like', 'comment', 'reply', 'follow'));

create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications(user_id, actor_id, type, log_id)
      values (new.following_id, new.follower_id, 'follow', null);
  elsif tg_op = 'DELETE' then
    delete from public.notifications
      where type = 'follow'
        and actor_id = old.follower_id
        and user_id = old.following_id;
  end if;
  return null;
end $$;

drop trigger if exists follow_notify_trg on public.follows;
create trigger follow_notify_trg
  after insert or delete on public.follows
  for each row execute function public.notify_on_follow();
