-- ════════════════════════════════════════════════════════════════
-- chalog — 알림(notifications)
--   내 공개 기록에 좋아요/댓글, 내 댓글에 답글이 달리면 알림 생성.
--   좋아요/댓글 insert 트리거(SECURITY DEFINER)로 자동 적재.
--   Supabase SQL Editor에 붙여넣고 Run. (재실행 안전)
-- ════════════════════════════════════════════════════════════════

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,   -- 받는 사람
  actor_id   uuid not null references public.users(id) on delete cascade,   -- 행동한 사람
  type       text not null check (type in ('like', 'comment', 'reply')),
  log_id     uuid not null references public.tea_logs(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- 본인 알림만 조회/읽음처리 (생성은 트리거 SECURITY DEFINER)
drop policy if exists "notif_select_own" on public.notifications;
create policy "notif_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notif_update_own" on public.notifications;
create policy "notif_update_own" on public.notifications
  for update using (user_id = auth.uid());

drop policy if exists "notif_delete_own" on public.notifications;
create policy "notif_delete_own" on public.notifications
  for delete using (user_id = auth.uid());

-- ── 좋아요 → 알림 (언라이크 시 제거) ──────────────────────────
create or replace function public.notify_on_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  if tg_op = 'INSERT' then
    select user_id into owner from public.tea_logs where id = new.log_id;
    if owner is not null and owner <> new.user_id then
      insert into public.notifications(user_id, actor_id, type, log_id)
        values (owner, new.user_id, 'like', new.log_id);
    end if;
  elsif tg_op = 'DELETE' then
    delete from public.notifications
      where type = 'like' and log_id = old.log_id and actor_id = old.user_id;
  end if;
  return null;
end $$;

drop trigger if exists like_notify_trg on public.likes;
create trigger like_notify_trg
  after insert or delete on public.likes
  for each row execute function public.notify_on_like();

-- ── 댓글/답글 → 알림 ──────────────────────────────────────────
create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare log_owner uuid; parent_author uuid;
begin
  if new.parent_id is null then
    select user_id into log_owner from public.tea_logs where id = new.log_id;
    if log_owner is not null and log_owner <> new.user_id then
      insert into public.notifications(user_id, actor_id, type, log_id, comment_id)
        values (log_owner, new.user_id, 'comment', new.log_id, new.id);
    end if;
  else
    select user_id into parent_author from public.comments where id = new.parent_id;
    if parent_author is not null and parent_author <> new.user_id then
      insert into public.notifications(user_id, actor_id, type, log_id, comment_id)
        values (parent_author, new.user_id, 'reply', new.log_id, new.id);
    end if;
  end if;
  return null;
end $$;

drop trigger if exists comment_notify_trg on public.comments;
create trigger comment_notify_trg
  after insert on public.comments
  for each row execute function public.notify_on_comment();
