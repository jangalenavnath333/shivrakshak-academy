-- Preserve every field submitted by the digital admission form while keeping
-- the existing students columns available to dashboard, fee and attendance features.
alter table public.students
  add column if not exists admission_details jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'students_admission_details_object'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_admission_details_object
      check (jsonb_typeof(admission_details) = 'object');
  end if;
end $$;

comment on column public.students.admission_details is
  'Validated snapshot of every field submitted through the digital admission form.';
