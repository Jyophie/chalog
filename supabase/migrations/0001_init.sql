-- ════════════════════════════════════════════════════════════════
-- chalog 초기 스키마 (MVP 명세 §6)
--   users · teas · brewing_guides · tea_logs + RLS + Storage
--   Supabase SQL Editor에 통째로 붙여넣고 Run.
-- ════════════════════════════════════════════════════════════════

-- ── extensions ─────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── enums ──────────────────────────────────────────────────────
do $$ begin
  create type tea_category as enum (
    '녹차','백차','황차','우롱차/청차','홍차','흑차/보이차',
    '말차','블렌딩 티','허브티','잘 모르겠음'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type leaf_shape as enum (
    '길고 꼬여 있음','동그랗게 말려 있음','납작함',
    '압축된 덩어리','가루 형태','티백','잘 모르겠음'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type brewing_tool as enum (
    '머그컵','티팟','개완','자사호','텀블러','잘 모르겠음'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type confidence_level as enum ('높음','중간','낮음');
exception when duplicate_object then null; end $$;

-- ── updated_at 자동 갱신 트리거 함수 ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ════════════════════════════════════════════════════════════════
-- 1. users  (auth.users 미러 프로필)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  display_name text,
  created_at  timestamptz not null default now()
);

-- 신규 가입 시 자동으로 public.users 행 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════
-- 2. teas  (저장한 차 + AI 분석 + 사용자 보정)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.teas (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  tea_name         text,
  tea_category     tea_category,
  brand            text,
  origin           text,
  production_year  text,
  image_url        text,            -- storage 경로 (tea-images/{uid}/...)
  -- 사용자 보정
  leaf_shape       leaf_shape,
  is_compressed    boolean not null default false,
  brewing_tool     brewing_tool,
  drinking_style   text,
  user_memo        text,
  -- AI 분석 메타
  ai_summary       text,
  confidence_level confidence_level,
  extracted_text   text,
  -- 컬렉션
  is_favorite      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists teas_user_id_idx on public.teas(user_id);
create index if not exists teas_user_created_idx on public.teas(user_id, created_at desc);

drop trigger if exists teas_set_updated_at on public.teas;
create trigger teas_set_updated_at
  before update on public.teas
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════
-- 3. brewing_guides  (차당 1개 — MVP는 1:1, tea_id unique)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.brewing_guides (
  id                uuid primary key default gen_random_uuid(),
  tea_id            uuid not null unique references public.teas(id) on delete cascade,
  water_temperature text,
  tea_amount        text,
  steeping_time     text,
  recommended_tool  text,
  rinse_method      text,
  guide_text        text,
  adjustment_tips   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists brewing_guides_tea_id_idx on public.brewing_guides(tea_id);

drop trigger if exists brewing_guides_set_updated_at on public.brewing_guides;
create trigger brewing_guides_set_updated_at
  before update on public.brewing_guides
  for each row execute function public.set_updated_at();

-- ════════════════════════════════════════════════════════════════
-- 4. tea_logs  (마신 기록)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.tea_logs (
  id                uuid primary key default gen_random_uuid(),
  tea_id            uuid not null references public.teas(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  brewed_at         date not null default current_date,
  photo_url         text,
  water_temperature text,
  tea_amount        text,
  steeping_time     text,
  tool              brewing_tool,
  taste_memo        text,
  aroma_memo        text,
  bitterness_level  smallint check (bitterness_level between 1 and 5),
  astringency_level smallint check (astringency_level between 1 and 5),
  rating            smallint check (rating between 1 and 5),
  next_adjustment   text,
  created_at        timestamptz not null default now()
);
create index if not exists tea_logs_tea_id_idx on public.tea_logs(tea_id, brewed_at desc);
create index if not exists tea_logs_user_id_idx on public.tea_logs(user_id);

-- ════════════════════════════════════════════════════════════════
-- RLS — 본인 데이터만 접근
-- ════════════════════════════════════════════════════════════════
alter table public.users          enable row level security;
alter table public.teas           enable row level security;
alter table public.brewing_guides enable row level security;
alter table public.tea_logs       enable row level security;

-- users
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- teas (본인 소유)
drop policy if exists "teas_all_own" on public.teas;
create policy "teas_all_own" on public.teas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- brewing_guides (소유 tea를 통해)
drop policy if exists "guides_all_own" on public.brewing_guides;
create policy "guides_all_own" on public.brewing_guides
  for all using (
    exists (select 1 from public.teas t where t.id = tea_id and t.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.teas t where t.id = tea_id and t.user_id = auth.uid())
  );

-- tea_logs (본인 소유)
drop policy if exists "logs_all_own" on public.tea_logs;
create policy "logs_all_own" on public.tea_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════
-- Storage — 차 이미지 비공개 버킷 (본인 폴더만)
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tea-images', 'tea-images', false, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "tea_images_insert_own" on storage.objects;
create policy "tea_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'tea-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tea_images_select_own" on storage.objects;
create policy "tea_images_select_own" on storage.objects
  for select using (
    bucket_id = 'tea-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "tea_images_delete_own" on storage.objects;
create policy "tea_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'tea-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
