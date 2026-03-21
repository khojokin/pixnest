create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  photo_id text not null,
  reporter_user_id uuid null,
  reporter_email text null,
  reason text not null,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

alter table public.post_reports enable row level security;

drop policy if exists "allow signed in insert post reports" on public.post_reports;
create policy "allow signed in insert post reports"
on public.post_reports
for insert
to authenticated
with check (true);

drop policy if exists "admin read post reports" on public.post_reports;
create policy "admin read post reports"
on public.post_reports
for select
to authenticated
using (true);
