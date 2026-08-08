-- Phase 1 security hardening (review before applying in Supabase SQL Editor).
-- This migration changes access policies only. It does not delete application data.

begin;

create sequence if not exists public.admission_code_seq;

do $$
declare
  current_max bigint;
  sequence_value bigint;
  sequence_called boolean;
begin
  select coalesce(max(substring(roll_number from '^S-([0-9]+)$')::bigint), 0)
    into current_max
    from public.students
    where roll_number ~ '^S-[0-9]+$';
  select last_value, is_called into sequence_value, sequence_called from public.admission_code_seq;
  perform setval(
    'public.admission_code_seq',
    greatest(current_max, sequence_value, 1),
    current_max > 0 or sequence_called
  );
end $$;

create or replace function public.next_admission_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role'
     and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'not authorized';
  end if;
  return 'S-' || lpad(nextval('public.admission_code_seq')::text, 2, '0');
end;
$$;

alter table public.students alter column roll_number set default public.next_admission_code();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on function public.next_admission_code() from public, anon;
grant execute on function public.next_admission_code() to authenticated, service_role;

create table if not exists public.admission_rate_limits (
  rate_key text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.admission_rate_limits enable row level security;

create or replace function public.consume_admission_rate_limit(p_key text)
returns boolean language plpgsql security definer set search_path = public
as $$
declare allowed boolean;
begin
  insert into public.admission_rate_limits(rate_key, window_started, attempts)
  values (p_key, now(), 1)
  on conflict (rate_key) do update set
    window_started = case when admission_rate_limits.window_started < now() - interval '1 hour' then now() else admission_rate_limits.window_started end,
    attempts = case when admission_rate_limits.window_started < now() - interval '1 hour' then 1 else admission_rate_limits.attempts + 1 end
  returning attempts <= 5 into allowed;
  return allowed;
end $$;
revoke all on function public.consume_admission_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_admission_rate_limit(text) to service_role;

alter table public.students enable row level security;
alter table public.fee_payments enable row level security;
alter table public.documents enable row level security;
alter table public.mess_subscriptions enable row level security;
alter table public.notices enable row level security;
alter table public.whatsapp_logs enable row level security;

drop policy if exists "allow_all_students" on public.students;
drop policy if exists "allow_all_fees" on public.fee_payments;
drop policy if exists "allow_all_docs" on public.documents;
drop policy if exists "allow_all_mess" on public.mess_subscriptions;
drop policy if exists "allow_all_notices" on public.notices;
drop policy if exists "allow_all_wa" on public.whatsapp_logs;

drop policy if exists "admin_all_students" on public.students;
drop policy if exists "admin_all_fees" on public.fee_payments;
drop policy if exists "admin_all_documents" on public.documents;
drop policy if exists "admin_all_docs" on public.documents;
drop policy if exists "admin_all_mess" on public.mess_subscriptions;
drop policy if exists "admin_all_notices" on public.notices;
drop policy if exists "admin_all_whatsapp_logs" on public.whatsapp_logs;
drop policy if exists "admin_all_wa" on public.whatsapp_logs;
drop policy if exists "public_read_published_notices" on public.notices;

create policy "admin_all_students" on public.students
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_fees" on public.fee_payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_documents" on public.documents
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_mess" on public.mess_subscriptions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_notices" on public.notices
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin_all_whatsapp_logs" on public.whatsapp_logs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public_read_published_notices" on public.notices
  for select to anon, authenticated using (is_published = true or public.is_admin());

-- Ensure views execute with the caller's permissions/RLS (PostgreSQL 15+).
alter view public.student_fee_summary set (security_invoker = true);
alter view public.mess_expiry_reminders set (security_invoker = true);

-- Student identity documents must never be public.
update storage.buckets set public = false where id = 'student-documents';
insert into storage.buckets (id, name, public)
values ('notice-attachments', 'notice-attachments', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public_read" on storage.objects;
drop policy if exists "public_upload" on storage.objects;
drop policy if exists "public_update" on storage.objects;
drop policy if exists "public_delete" on storage.objects;
drop policy if exists "admin_manage_student_documents" on storage.objects;
drop policy if exists "public_read_public_academy_files" on storage.objects;
drop policy if exists "admin_manage_academy_files" on storage.objects;
drop policy if exists "admin_storage_all" on storage.objects;

create policy "public_read_public_academy_files" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('student-photos', 'notice-attachments'));

create policy "admin_manage_academy_files" on storage.objects
  for all to authenticated
  using (bucket_id in ('student-photos', 'student-documents', 'notice-attachments') and public.is_admin())
  with check (bucket_id in ('student-photos', 'student-documents', 'notice-attachments') and public.is_admin());

commit;
