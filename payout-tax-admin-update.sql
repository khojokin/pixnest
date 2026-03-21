
create extension if not exists pgcrypto;

create table if not exists public.creator_payout_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_name text,
  bank_name text,
  account_number text,
  sort_code text,
  iban text,
  swift_code text,
  country text,
  currency text not null default 'GBP',
  payout_email text,
  is_payout_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_payout_requests
  add column if not exists currency text default 'GBP',
  add column if not exists payout_method text default 'bank_transfer',
  add column if not exists notes text,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists paid_at timestamptz;

create table if not exists public.creator_tax_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null default '',
  business_name text,
  tax_form_type text not null default 'individual',
  tax_country text not null default '',
  tax_identifier text not null default '',
  address_line1 text,
  address_line2 text,
  city text,
  region text,
  postcode text,
  document_url text,
  notes text,
  status text not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists creator_payout_profiles_set_updated_at on public.creator_payout_profiles;
create trigger creator_payout_profiles_set_updated_at
before update on public.creator_payout_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists creator_tax_forms_set_updated_at on public.creator_tax_forms;
create trigger creator_tax_forms_set_updated_at
before update on public.creator_tax_forms
for each row
execute function public.set_updated_at();

alter table public.creator_payout_profiles enable row level security;
alter table public.creator_payout_requests enable row level security;
alter table public.creator_tax_forms enable row level security;

drop policy if exists "payout profile own read" on public.creator_payout_profiles;
create policy "payout profile own read"
on public.creator_payout_profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "payout profile own insert" on public.creator_payout_profiles;
create policy "payout profile own insert"
on public.creator_payout_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "payout profile own update" on public.creator_payout_profiles;
create policy "payout profile own update"
on public.creator_payout_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "admin payout profiles read" on public.creator_payout_profiles;
create policy "admin payout profiles read"
on public.creator_payout_profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admin payout profiles update" on public.creator_payout_profiles;
create policy "admin payout profiles update"
on public.creator_payout_profiles
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "creator payout request insert own" on public.creator_payout_requests;
create policy "creator payout request insert own"
on public.creator_payout_requests
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "creator payout request read own" on public.creator_payout_requests;
create policy "creator payout request read own"
on public.creator_payout_requests
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admin payout request read" on public.creator_payout_requests;
create policy "admin payout request read"
on public.creator_payout_requests
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admin payout request update" on public.creator_payout_requests;
create policy "admin payout request update"
on public.creator_payout_requests
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "creator tax form insert own" on public.creator_tax_forms;
create policy "creator tax form insert own"
on public.creator_tax_forms
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "creator tax form read own" on public.creator_tax_forms;
create policy "creator tax form read own"
on public.creator_tax_forms
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admin tax form read" on public.creator_tax_forms;
create policy "admin tax form read"
on public.creator_tax_forms
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admin tax form update" on public.creator_tax_forms;
create policy "admin tax form update"
on public.creator_tax_forms
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
