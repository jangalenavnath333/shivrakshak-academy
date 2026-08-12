-- Student leave register and reliable return-date reminders.
-- All writes happen through authenticated admin APIs. The cron worker uses service_role.

create table if not exists public.student_leaves (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  departure_date date not null,
  return_date date not null,
  reason text not null default '',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'on_leave', 'returned', 'cancelled')),
  notification_email text,
  notification_phone text,
  notify_email boolean not null default true,
  notify_whatsapp boolean not null default true,
  confirmation_email_sent_at timestamptz,
  confirmation_whatsapp_sent_at timestamptz,
  reminder_email_status text not null default 'pending'
    check (reminder_email_status in ('pending', 'sent', 'skipped', 'failed')),
  reminder_whatsapp_status text not null default 'pending'
    check (reminder_whatsapp_status in ('pending', 'sent', 'skipped', 'failed')),
  reminder_email_sent_at timestamptz,
  reminder_whatsapp_sent_at timestamptz,
  reminder_claimed_at timestamptz,
  reminder_processed_at timestamptz,
  last_notification_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (return_date >= departure_date),
  check (char_length(reason) <= 1000),
  check (notification_email is null or char_length(notification_email) <= 320),
  check (notification_phone is null or char_length(notification_phone) <= 20)
);

create index if not exists student_leaves_student_id_idx
  on public.student_leaves(student_id, departure_date desc);

create index if not exists student_leaves_due_reminder_idx
  on public.student_leaves(return_date, reminder_claimed_at)
  where status in ('scheduled', 'on_leave');

-- Public leave requests are linked to an existing student by the server API and
-- remain pending until an authenticated admin approves or rejects them.
alter table public.student_leaves
  drop constraint if exists student_leaves_status_check;
alter table public.student_leaves
  add constraint student_leaves_status_check
  check (status in ('pending', 'scheduled', 'on_leave', 'returned', 'cancelled', 'rejected'));

alter table public.student_leaves
  add column if not exists request_source text not null default 'admin'
    check (request_source in ('admin', 'public')),
  add column if not exists requested_name text,
  add column if not exists requested_phone text,
  add column if not exists requested_days integer
    check (requested_days is null or requested_days between 1 and 30),
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

create index if not exists student_leaves_pending_requests_idx
  on public.student_leaves(created_at desc)
  where status = 'pending';

alter table public.student_leaves enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'student_leaves' and policyname = 'Admins can view student leaves'
  ) then
    create policy "Admins can view student leaves"
      on public.student_leaves for select
      to authenticated
      using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'student_leaves' and policyname = 'Admins can create student leaves'
  ) then
    create policy "Admins can create student leaves"
      on public.student_leaves for insert
      to authenticated
      with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'student_leaves' and policyname = 'Admins can update student leaves'
  ) then
    create policy "Admins can update student leaves"
      on public.student_leaves for update
      to authenticated
      using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
      with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  end if;
end
$$;

grant select, insert, update on table public.student_leaves to authenticated;
grant all on table public.student_leaves to service_role;

-- Public form abuse protection. The table is never exposed to browser roles;
-- only the server-side service client can consume a rate-limit slot.
create table if not exists public.leave_request_rate_limits (
  rate_key text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0)
);

alter table public.leave_request_rate_limits enable row level security;
revoke all on table public.leave_request_rate_limits from public, anon, authenticated;
grant all on table public.leave_request_rate_limits to service_role;

create or replace function public.consume_leave_request_rate_limit(p_key text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_allowed boolean;
begin
  if p_key is null or char_length(p_key) < 3 or char_length(p_key) > 180 then
    return false;
  end if;

  insert into public.leave_request_rate_limits as limits(rate_key, window_started, attempts)
  values (p_key, now(), 1)
  on conflict (rate_key) do update set
    window_started = case
      when limits.window_started < now() - interval '1 hour' then now()
      else limits.window_started
    end,
    attempts = case
      when limits.window_started < now() - interval '1 hour' then 1
      else limits.attempts + 1
    end
  returning attempts <= 5 into v_allowed;

  return coalesce(v_allowed, false);
end;
$$;

revoke all on function public.consume_leave_request_rate_limit(text)
  from public, anon, authenticated;
grant execute on function public.consume_leave_request_rate_limit(text)
  to service_role;

-- Atomically claims due reminders. Vercel can invoke a Cron Job more than once,
-- so row locks plus a short claim lease prevent concurrent duplicate delivery.
create or replace function public.claim_due_student_leave_reminders(
  p_today date,
  p_limit integer default 100
)
returns setof public.student_leaves
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with due as (
    select leave_row.id
    from public.student_leaves as leave_row
    where leave_row.return_date <= p_today
      and leave_row.status in ('scheduled', 'on_leave')
      and (
        leave_row.reminder_email_status in ('pending', 'failed')
        or leave_row.reminder_whatsapp_status in ('pending', 'failed')
      )
      and (
        leave_row.reminder_claimed_at is null
        or leave_row.reminder_claimed_at < now() - interval '20 minutes'
      )
    order by leave_row.return_date asc, leave_row.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 100), 500))
  )
  update public.student_leaves as leave_row
  set reminder_claimed_at = now(), updated_at = now()
  from due
  where leave_row.id = due.id
  returning leave_row.*;
end;
$$;

revoke all on function public.claim_due_student_leave_reminders(date, integer)
  from public, anon, authenticated;
grant execute on function public.claim_due_student_leave_reminders(date, integer)
  to service_role;
