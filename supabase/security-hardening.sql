-- Phase 1 schema and access-control hardening.
-- Review the preflight and Dashboard steps in README.md before applying this file.
-- This migration preserves application rows and contains no DELETE, TRUNCATE, or DROP TABLE.
-- Duplicate documents(student_id, doc_type) must be reconciled manually; this file
-- intentionally does not delete duplicates or add a uniqueness constraint.

begin;

-- Fail before making changes when the expected baseline schema is incomplete.
do $$
declare
  required_table text;
  required_view text;
begin
  foreach required_table in array array[
    'students', 'fee_payments', 'documents', 'mess_subscriptions',
    'notices', 'whatsapp_logs'
  ] loop
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = required_table
        and c.relkind in ('r', 'p')
    ) then
      raise exception 'Required table public.% is missing or is not a table', required_table;
    end if;
  end loop;

  foreach required_view in array array[
    'student_fee_summary', 'mess_expiry_reminders'
  ] loop
    if not exists (
      select 1 from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = required_view
        and c.relkind = 'v'
    ) then
      raise exception 'Required view public.% is missing or is not a view', required_view;
    end if;
  end loop;

  -- These names were used by the legacy setup script on the global
  -- storage.objects table. Their predicates may cover unrelated buckets, so
  -- this migration will not drop them blindly. Inventory pg_policies, replace
  -- only the academy-owned legacy policies manually, then rerun this migration.
  if exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname in (
        'public_read', 'public_upload', 'public_update', 'public_delete',
        'admin_storage_all', 'admin_manage_student_documents'
      )
  ) then
    raise exception using
      message = 'Legacy generic storage policies require manual review',
      hint = 'Inventory storage.objects policies and remove only confirmed academy-owned legacy policies; do not remove policies used by other buckets.';
  end if;
end $$;

create sequence if not exists public.admission_code_seq;

create or replace function public.next_admission_code()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role'
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

-- Bucket creation, privacy, MIME types, and size limits are managed through the
-- Supabase Dashboard/Storage API. Do not modify storage.buckets directly here.
-- Only replace policies owned by this migration. Other storage.objects policies
-- are preserved because they may serve unrelated buckets in the same project.
drop policy if exists "public_read_public_academy_files" on storage.objects;
drop policy if exists "admin_manage_academy_files" on storage.objects;

create policy "public_read_public_academy_files" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('student-photos', 'notice-attachments'));

create policy "admin_manage_academy_files" on storage.objects
  for all to authenticated
  using (bucket_id in ('student-photos', 'student-documents', 'notice-attachments') and public.is_admin())
  with check (bucket_id in ('student-photos', 'student-documents', 'notice-attachments') and public.is_admin());

-- Initialize only after all compatibility checks and failure-prone DDL. Sequence
-- changes are not rolled back like ordinary table changes, so keep this last.
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
  select last_value, is_called
    into sequence_value, sequence_called
    from public.admission_code_seq;
  perform setval(
    'public.admission_code_seq',
    greatest(current_max, sequence_value, 1),
    current_max > 0 or sequence_called
  );
end $$;

commit;
