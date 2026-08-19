-- Secure student authentication and online examination system.
-- Apply through Supabase migrations after reviewing the production project.

begin;

alter table public.students
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;
create unique index if not exists students_auth_user_id_key
  on public.students(auth_user_id) where auth_user_id is not null;

alter table public.exams add column if not exists instructions text not null default '';
alter table public.exams add column if not exists course text not null default 'all';
alter table public.exams add column if not exists negative_marks numeric(8,2) not null default 0;
alter table public.exams add column if not exists pass_marks numeric(8,2) not null default 0;
alter table public.exams add column if not exists max_attempts integer not null default 1;
alter table public.exams add column if not exists result_release_at timestamptz;

alter table public.exams drop constraint if exists exams_negative_marks_check;
alter table public.exams add constraint exams_negative_marks_check check (negative_marks >= 0);
alter table public.exams drop constraint if exists exams_pass_marks_check;
alter table public.exams add constraint exams_pass_marks_check check (pass_marks >= 0);
alter table public.exams drop constraint if exists exams_max_attempts_check;
alter table public.exams add constraint exams_max_attempts_check check (max_attempts between 1 and 10);
alter table public.exams drop constraint if exists exams_schedule_check;
alter table public.exams add constraint exams_schedule_check check (ends_at is null or starts_at is null or ends_at > starts_at);

create table if not exists public.exam_question_keys (
  question_id uuid primary key references public.exam_questions(id) on delete cascade,
  correct_option text not null check (correct_option ~ '^[0-9]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'exam_questions' and column_name = 'correct_option'
  ) then
    execute 'insert into public.exam_question_keys(question_id, correct_option)
             select id, correct_option from public.exam_questions
             on conflict (question_id) do update set correct_option = excluded.correct_option, updated_at = now()';
    execute 'alter table public.exam_questions drop column correct_option';
  end if;
end $$;

alter table public.exam_questions drop constraint if exists exam_questions_options_check;
alter table public.exam_questions add constraint exam_questions_options_check
  check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 8);
alter table public.exam_questions drop constraint if exists exam_questions_marks_check;
alter table public.exam_questions add constraint exam_questions_marks_check check (marks > 0);

alter table public.exam_attempts add column if not exists expires_at timestamptz;
alter table public.exam_attempts add column if not exists attempt_no integer not null default 1;
alter table public.exam_attempts add column if not exists max_score numeric(10,2);
alter table public.exam_attempts add column if not exists percentage numeric(6,2);
alter table public.exam_attempts add column if not exists correct_count integer not null default 0;
alter table public.exam_attempts add column if not exists wrong_count integer not null default 0;
alter table public.exam_attempts add column if not exists unanswered_count integer not null default 0;
create unique index if not exists exam_attempts_exam_student_attempt_key
  on public.exam_attempts(exam_id, student_id, attempt_no);
drop index if exists public.exam_answers_attempt_question_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.exam_answers'::regclass
      and conname = 'exam_answers_attempt_id_question_id_key'
  ) then
    alter table public.exam_answers
      add constraint exam_answers_attempt_id_question_id_key unique (attempt_id, question_id);
  end if;
end $$;

create table if not exists public.student_login_rate_limits (
  rate_key text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0)
);

alter table public.student_login_rate_limits enable row level security;
revoke all on table public.student_login_rate_limits from public, anon, authenticated;

create or replace function public.consume_student_login_rate_limit(p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if p_key is null or length(trim(p_key)) = 0 or length(p_key) > 180 then
    return false;
  end if;

  insert into public.student_login_rate_limits(rate_key, window_started, attempts)
  values (p_key, now(), 1)
  on conflict (rate_key) do update set
    window_started = case
      when student_login_rate_limits.window_started < now() - interval '15 minutes' then now()
      else student_login_rate_limits.window_started
    end,
    attempts = case
      when student_login_rate_limits.window_started < now() - interval '15 minutes' then 1
      else student_login_rate_limits.attempts + 1
    end
  returning attempts <= 10 into allowed;

  return allowed;
end;
$$;

revoke all on function public.consume_student_login_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_student_login_rate_limit(text) to service_role;

create or replace function public.finalize_exam_attempt(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exam_id uuid;
  v_negative numeric;
  v_score numeric;
  v_max_score numeric;
  v_total integer;
  v_correct integer;
  v_wrong integer;
begin
  select a.exam_id, e.negative_marks
    into v_exam_id, v_negative
    from public.exam_attempts a
    join public.exams e on e.id = a.exam_id
   where a.id = p_attempt_id
   for update of a;

  if v_exam_id is null then
    raise exception 'Attempt not found' using errcode = 'P0002';
  end if;

  update public.exam_answers answer
     set is_correct = answer.selected_option = answer_key.correct_option,
         marks_awarded = case
           when answer.selected_option is null then 0
           when answer.selected_option = answer_key.correct_option then question.marks
           else -v_negative
         end
    from public.exam_questions question
    join public.exam_question_keys answer_key on answer_key.question_id = question.id
   where answer.attempt_id = p_attempt_id
     and answer.question_id = question.id;

  select coalesce(sum(marks), 0), count(*)
    into v_max_score, v_total
    from public.exam_questions
   where exam_id = v_exam_id;

  select greatest(coalesce(sum(marks_awarded), 0), 0),
         count(*) filter (where is_correct is true),
         count(*) filter (where is_correct is false)
    into v_score, v_correct, v_wrong
    from public.exam_answers
   where attempt_id = p_attempt_id
     and selected_option is not null;

  update public.exam_attempts
     set submitted_at = coalesce(submitted_at, now()),
         status = 'evaluated',
         score = v_score,
         max_score = v_max_score,
         percentage = case when v_max_score > 0 then round((v_score / v_max_score) * 100, 2) else 0 end,
         correct_count = coalesce(v_correct, 0),
         wrong_count = coalesce(v_wrong, 0),
         unanswered_count = greatest(v_total - coalesce(v_correct, 0) - coalesce(v_wrong, 0), 0)
   where id = p_attempt_id;
end;
$$;

revoke all on function public.finalize_exam_attempt(uuid) from public, anon, authenticated;

drop function if exists public.start_student_exam(uuid);
drop function if exists public.save_student_exam_answer(uuid, uuid, text);
drop function if exists public.submit_student_exam(uuid);

create or replace function public.start_student_exam(p_exam_id uuid, p_auth_user_id uuid)
returns table(attempt_id uuid, expires_at timestamptz, resumed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_student_course text;
  v_exam public.exams%rowtype;
  v_attempt public.exam_attempts%rowtype;
  v_attempt_count integer;
  v_attempt_no integer;
  v_expires_at timestamptz;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '28000';
  end if;

  select id, course into v_student_id, v_student_course
    from public.students
   where auth_user_id = p_auth_user_id and is_active = true;

  if v_student_id is null then
    raise exception 'Student account is not active' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_student_id::text || ':' || p_exam_id::text, 0));

  select * into v_exam from public.exams where id = p_exam_id and is_published = true for update;
  if not found then raise exception 'Exam not found' using errcode = 'P0002'; end if;
  if v_exam.course <> 'all' and v_exam.course <> coalesce(v_student_course, '') then raise exception 'Exam is not assigned to this course' using errcode = '28000'; end if;
  if v_exam.starts_at is not null and now() < v_exam.starts_at then raise exception 'Exam has not started'; end if;
  if v_exam.ends_at is not null and now() >= v_exam.ends_at then raise exception 'Exam has ended'; end if;
  if not exists (select 1 from public.exam_questions where exam_id = p_exam_id) then raise exception 'Exam has no questions'; end if;

  select * into v_attempt
    from public.exam_attempts
   where exam_id = p_exam_id and student_id = v_student_id and status = 'in_progress'
   order by attempt_no desc
   limit 1
   for update;

  if found and v_attempt.expires_at > now() then
    return query select v_attempt.id, v_attempt.expires_at, true;
    return;
  elsif found then
    perform public.finalize_exam_attempt(v_attempt.id);
  end if;

  select count(*), coalesce(max(attempt_no), 0) + 1
    into v_attempt_count, v_attempt_no
    from public.exam_attempts
   where exam_id = p_exam_id and student_id = v_student_id;

  if v_attempt_count >= v_exam.max_attempts then
    raise exception 'Maximum attempts used';
  end if;

  v_expires_at := now() + make_interval(mins => v_exam.duration_minutes);
  if v_exam.ends_at is not null and v_expires_at > v_exam.ends_at then
    v_expires_at := v_exam.ends_at;
  end if;

  insert into public.exam_attempts(exam_id, student_id, started_at, expires_at, attempt_no, status)
  values (p_exam_id, v_student_id, now(), v_expires_at, v_attempt_no, 'in_progress')
  returning * into v_attempt;

  return query select v_attempt.id, v_attempt.expires_at, false;
end;
$$;

create or replace function public.save_student_exam_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_option text,
  p_auth_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exam_id uuid;
  v_options integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '28000';
  end if;

  select a.exam_id into v_exam_id
    from public.exam_attempts a
    join public.students s on s.id = a.student_id
   where a.id = p_attempt_id
     and s.auth_user_id = p_auth_user_id
     and a.status = 'in_progress'
     and a.expires_at > now()
   for update of a;

  if v_exam_id is null then raise exception 'Attempt is not active' using errcode = '28000'; end if;

  select jsonb_array_length(options) into v_options
    from public.exam_questions
   where id = p_question_id and exam_id = v_exam_id;

  if v_options is null then raise exception 'Question not found' using errcode = 'P0002'; end if;
  if p_selected_option is not null and (
    p_selected_option !~ '^[0-9]+$'
    or p_selected_option::integer < 0
    or p_selected_option::integer >= v_options
  ) then raise exception 'Invalid answer'; end if;

  insert into public.exam_answers(attempt_id, question_id, selected_option, is_correct, marks_awarded)
  values (p_attempt_id, p_question_id, p_selected_option, null, null)
  on conflict (attempt_id, question_id) do update set
    selected_option = excluded.selected_option,
    is_correct = null,
    marks_awarded = null;
end;
$$;

create or replace function public.submit_student_exam(p_attempt_id uuid, p_auth_user_id uuid)
returns table(
  submitted_at timestamptz,
  result_released boolean,
  score numeric,
  max_score numeric,
  percentage numeric,
  correct_count integer,
  wrong_count integer,
  unanswered_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owned boolean;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '28000';
  end if;

  select true into v_owned
    from public.exam_attempts a
    join public.students s on s.id = a.student_id
   where a.id = p_attempt_id and s.auth_user_id = p_auth_user_id;

  if not coalesce(v_owned, false) then raise exception 'Attempt not found' using errcode = 'P0002'; end if;

  if exists (select 1 from public.exam_attempts where id = p_attempt_id and status = 'in_progress') then
    perform public.finalize_exam_attempt(p_attempt_id);
  end if;

  return query
  select a.submitted_at,
         (e.result_release_at is null or e.result_release_at <= now()) as result_released,
         case when e.result_release_at is null or e.result_release_at <= now() then a.score else null end,
         case when e.result_release_at is null or e.result_release_at <= now() then a.max_score else null end,
         case when e.result_release_at is null or e.result_release_at <= now() then a.percentage else null end,
         case when e.result_release_at is null or e.result_release_at <= now() then a.correct_count else null end,
         case when e.result_release_at is null or e.result_release_at <= now() then a.wrong_count else null end,
         case when e.result_release_at is null or e.result_release_at <= now() then a.unanswered_count else null end
    from public.exam_attempts a
    join public.exams e on e.id = a.exam_id
   where a.id = p_attempt_id;
end;
$$;

revoke all on function public.start_student_exam(uuid, uuid) from public, anon, authenticated;
revoke all on function public.save_student_exam_answer(uuid, uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.submit_student_exam(uuid, uuid) from public, anon, authenticated;
grant execute on function public.start_student_exam(uuid, uuid) to service_role;
grant execute on function public.save_student_exam_answer(uuid, uuid, text, uuid) to service_role;
grant execute on function public.submit_student_exam(uuid, uuid) to service_role;

create or replace function public.admin_upsert_exam_question(
  p_exam_id uuid,
  p_question_id uuid,
  p_question_text text,
  p_options jsonb,
  p_marks numeric,
  p_sort_order integer,
  p_correct_option text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_question_id uuid;
  v_option_count integer;
  v_total_marks numeric;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '28000';
  end if;
  perform 1 from public.exams where id = p_exam_id for update;
  if not found then
    raise exception 'Exam not found' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.exam_attempts where exam_id = p_exam_id) then
    raise exception 'Question paper is locked after the first attempt' using errcode = '55000';
  end if;

  v_option_count := jsonb_array_length(p_options);
  if v_option_count < 2 or v_option_count > 8
     or p_correct_option !~ '^[0-9]+$'
     or p_correct_option::integer < 0
     or p_correct_option::integer >= v_option_count then
    raise exception 'Invalid question options' using errcode = '22023';
  end if;

  if p_question_id is null then
    insert into public.exam_questions(exam_id, question_text, options, marks, sort_order)
    values (p_exam_id, p_question_text, p_options, p_marks, p_sort_order)
    returning id into v_question_id;
  else
    update public.exam_questions
       set question_text = p_question_text,
           options = p_options,
           marks = p_marks,
           sort_order = p_sort_order
     where id = p_question_id and exam_id = p_exam_id
     returning id into v_question_id;
    if v_question_id is null then
      raise exception 'Question not found' using errcode = 'P0002';
    end if;
  end if;

  insert into public.exam_question_keys(question_id, correct_option, updated_at)
  values (v_question_id, p_correct_option, now())
  on conflict (question_id) do update set
    correct_option = excluded.correct_option,
    updated_at = now();

  select coalesce(sum(marks), 0) into v_total_marks
    from public.exam_questions where exam_id = p_exam_id;
  update public.exams set total_marks = v_total_marks where id = p_exam_id;
  return v_question_id;
end;
$$;

create or replace function public.admin_delete_exam_question(p_exam_id uuid, p_question_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_marks numeric;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '28000';
  end if;
  perform 1 from public.exams where id = p_exam_id for update;
  if not found then raise exception 'Exam not found' using errcode = 'P0002'; end if;
  if exists (select 1 from public.exam_attempts where exam_id = p_exam_id) then
    raise exception 'Question paper is locked after the first attempt' using errcode = '55000';
  end if;

  delete from public.exam_questions where id = p_question_id and exam_id = p_exam_id;
  if not found then raise exception 'Question not found' using errcode = 'P0002'; end if;

  select coalesce(sum(marks), 0) into v_total_marks
    from public.exam_questions where exam_id = p_exam_id;
  update public.exams set total_marks = v_total_marks where id = p_exam_id;
end;
$$;

revoke all on function public.admin_upsert_exam_question(uuid, uuid, text, jsonb, numeric, integer, text) from public, anon, authenticated;
revoke all on function public.admin_delete_exam_question(uuid, uuid) from public, anon, authenticated;
grant execute on function public.admin_upsert_exam_question(uuid, uuid, text, jsonb, numeric, integer, text) to service_role;
grant execute on function public.admin_delete_exam_question(uuid, uuid) to service_role;

create or replace function public.protect_started_exam_configuration()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (select 1 from public.exam_attempts where exam_id = old.id)
     and (
       old.course is distinct from new.course
       or old.duration_minutes is distinct from new.duration_minutes
       or old.total_marks is distinct from new.total_marks
       or old.negative_marks is distinct from new.negative_marks
       or old.pass_marks is distinct from new.pass_marks
       or old.max_attempts is distinct from new.max_attempts
     ) then
    raise exception 'Exam configuration is locked after the first attempt' using errcode = '55000';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_started_exam_configuration on public.exams;
create trigger protect_started_exam_configuration
before update on public.exams
for each row execute function public.protect_started_exam_configuration();

alter table public.exam_question_keys enable row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_answers enable row level security;

drop policy if exists "public read questions for live exams" on public.exam_questions;
drop policy if exists "student manage own attempts" on public.exam_attempts;
drop policy if exists "student manage own answers" on public.exam_answers;
drop policy if exists "student read own attempts" on public.exam_attempts;
drop policy if exists "student read own answers" on public.exam_answers;
drop policy if exists "admin manage questions" on public.exam_questions;
drop policy if exists "admin manage attempts" on public.exam_attempts;
drop policy if exists "admin manage answers" on public.exam_answers;

create policy "student read own attempts" on public.exam_attempts
  for select to authenticated
  using (exists (
    select 1 from public.students s
    where s.id = exam_attempts.student_id and s.auth_user_id = (select auth.uid())
  ));

create policy "student read own answers" on public.exam_answers
  for select to authenticated
  using (exists (
    select 1
      from public.exam_attempts a
      join public.students s on s.id = a.student_id
     where a.id = exam_answers.attempt_id and s.auth_user_id = (select auth.uid())
  ));

revoke all on table public.exam_question_keys from public, anon, authenticated;
revoke all on table public.exam_questions from public, anon, authenticated;
revoke insert, update, delete on table public.exam_attempts from anon, authenticated;
revoke insert, update, delete on table public.exam_answers from anon, authenticated;
grant select on table public.exam_attempts, public.exam_answers to authenticated;
grant all on table public.exam_question_keys, public.exam_questions, public.exam_attempts, public.exam_answers to service_role;

commit;
