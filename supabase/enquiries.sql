create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (phone ~ '^[0-9]{10}$'),
  email text,
  course text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;
revoke all on table public.enquiries from anon, authenticated;
grant insert on table public.enquiries to anon, authenticated;

drop policy if exists "public_can_submit_enquiries" on public.enquiries;
create policy "public_can_submit_enquiries"
on public.enquiries
for insert
to anon, authenticated
with check (
  status = 'new'
  and char_length(name) between 2 and 120
  and phone ~ '^[0-9]{10}$'
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

