create extension if not exists pgcrypto;

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'Wi-Fi / Internet', 'Electrical', 'Water / Plumbing', 'Cleaning',
    'Classroom / Lab Equipment', 'Other'
  )),
  location text not null check (char_length(trim(location)) between 2 and 120),
  normalized_location text not null check (char_length(normalized_location) between 2 and 120),
  title text not null check (char_length(trim(title)) between 5 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  status text not null default 'received' check (status in ('received', 'in_progress', 'fixed')),
  reporter_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.issue_supports (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  reporter_id uuid not null,
  created_at timestamptz not null default now(),
  constraint issue_supports_one_per_reporter unique (issue_id, reporter_id)
);

create index issues_matching_idx on public.issues (category, normalized_location, status, created_at desc);
create index issues_reporter_idx on public.issues (reporter_id, created_at desc);
create index issue_supports_reporter_idx on public.issue_supports (reporter_id, created_at desc);
create index issue_supports_issue_idx on public.issue_supports (issue_id);

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger issues_set_updated_at before update on public.issues
for each row execute function public.set_updated_at();

create function public.reject_support_for_resolved_issue() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  issue_status text;
  issue_reporter_id uuid;
begin
  select i.status, i.reporter_id into issue_status, issue_reporter_id
  from public.issues i where i.id = new.issue_id for update;
  if not found or issue_status not in ('received', 'in_progress') then
    raise exception 'Issue is not open for support' using errcode = '23514';
  end if;
  if issue_reporter_id = new.reporter_id then
    raise exception 'Original reporter is already counted as affected' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger issue_supports_require_open_issue before insert on public.issue_supports
for each row execute function public.reject_support_for_resolved_issue();

-- All browser access goes through authenticated server Route Handlers.
-- There are intentionally no anon/authenticated policies. The service-role key
-- bypasses RLS and must only be used in server-only modules after authorization.
alter table public.issues enable row level security;
alter table public.issue_supports enable row level security;
