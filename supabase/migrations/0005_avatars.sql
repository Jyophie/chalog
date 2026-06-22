-- ════════════════════════════════════════════════════════════════
-- chalog — 프로필 사진(avatar)
--   users.avatar_url + public_profiles 뷰에 노출 + avatars 공개 버킷
--   Supabase SQL Editor에 붙여넣고 Run. (재실행 안전)
-- ════════════════════════════════════════════════════════════════

alter table public.users add column if not exists avatar_url text;

-- public_profiles 뷰에 avatar_url 추가 (열을 끝에 추가 → replace 가능)
create or replace view public.public_profiles as
  select id, display_name, avatar_url from public.users;
grant select on public.public_profiles to anon, authenticated;

-- ── avatars 공개 버킷 (프로필 사진은 누구나 볼 수 있음) ─────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatars_read_all" on storage.objects;
create policy "avatars_read_all" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
