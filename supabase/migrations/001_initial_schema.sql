create extension if not exists pgcrypto;

create type public.job_status as enum ('Open', 'Closed');
create type public.candidate_status as enum (
  'Applied',
  'Form Submitted',
  'Interview Scheduled',
  'Offer Sent',
  'Hired',
  'Rejected'
);
create type public.interview_type as enum ('Screening', 'Technical');
create type public.interview_status as enum ('Scheduled', 'Completed');
create type public.interview_recommendation as enum ('Hire', 'No Hire', 'Maybe');
create type public.document_type as enum ('Offer Letter', 'NDA');

create table public.hr_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  required_skills text[] not null default '{}',
  status public.job_status not null default 'Open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete restrict,
  name text not null,
  email text not null,
  phone text,
  current_location text,
  current_position text,
  notice_period text,
  salary_expectation text,
  linkedin_url text,
  status public.candidate_status not null default 'Applied',
  resume_file_path text,
  resume_file_name text,
  rejection_reason text,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_tokens (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  scheduled_at timestamptz not null,
  type public.interview_type not null,
  interviewer_name text not null,
  notes text,
  status public.interview_status not null default 'Scheduled',
  recommendation public.interview_recommendation,
  feedback_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_interviews_have_feedback check (
    status = 'Scheduled'
    or (recommendation is not null and feedback_note is not null)
  )
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type public.document_type not null,
  file_path text not null,
  file_name text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index candidates_job_id_idx on public.candidates(job_id);
create index candidates_status_idx on public.candidates(status);
create index candidates_last_activity_at_idx on public.candidates(last_activity_at desc);
create index application_tokens_candidate_id_idx on public.application_tokens(candidate_id);
create index interviews_candidate_id_idx on public.interviews(candidate_id);
create index interviews_scheduled_at_idx on public.interviews(scheduled_at);
create index documents_candidate_id_idx on public.documents(candidate_id);
create index timeline_events_candidate_id_created_at_idx
  on public.timeline_events(candidate_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger set_candidates_updated_at
before update on public.candidates
for each row execute function public.set_updated_at();

create trigger set_interviews_updated_at
before update on public.interviews
for each row execute function public.set_updated_at();

alter table public.hr_users enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.application_tokens enable row level security;
alter table public.interviews enable row level security;
alter table public.documents enable row level security;
alter table public.timeline_events enable row level security;

create policy "HR users can read their own profile"
on public.hr_users for select
to authenticated
using (auth_user_id = auth.uid());

create policy "HR users can create their own profile"
on public.hr_users for insert
to authenticated
with check (auth_user_id = auth.uid());

create policy "HR users can update their own profile"
on public.hr_users for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "Authenticated HR can manage jobs"
on public.jobs for all
to authenticated
using (true)
with check (true);

create policy "Authenticated HR can manage candidates"
on public.candidates for all
to authenticated
using (true)
with check (true);

create policy "Authenticated HR can manage application tokens"
on public.application_tokens for all
to authenticated
using (true)
with check (true);

create policy "Authenticated HR can manage interviews"
on public.interviews for all
to authenticated
using (true)
with check (true);

create policy "Authenticated HR can manage documents"
on public.documents for all
to authenticated
using (true)
with check (true);

create policy "Authenticated HR can manage timeline events"
on public.timeline_events for all
to authenticated
using (true)
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do nothing;

create policy "Authenticated HR can read resumes"
on storage.objects for select
to authenticated
using (bucket_id = 'resumes');

create policy "Authenticated HR can upload resumes"
on storage.objects for insert
to authenticated
with check (bucket_id = 'resumes');

create policy "Authenticated HR can read documents"
on storage.objects for select
to authenticated
using (bucket_id = 'documents');

create policy "Authenticated HR can upload documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents');
