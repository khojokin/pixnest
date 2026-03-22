-- SQL schema and RLS policies for likes, follows and premium plans.
-- This file creates tables for tracking photo likes, user follows and premium plan
-- definitions. It also defines sensible row level security (RLS) policies to
-- ensure that users can only insert or delete their own records, while
-- administrators can manage plan pricing.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Table: photo_likes
-- Stores a record each time a user likes a photo. A composite unique
-- constraint could be added on (user_id, photo_id) if duplicates should be
-- prevented. RLS policies ensure users can only manage their own likes.
create table if not exists public.photo_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, photo_id)
);

alter table public.photo_likes enable row level security;

drop policy if exists "likes select" on public.photo_likes;
create policy "likes select"
  on public.photo_likes
  for select
  to authenticated
  using (true);

drop policy if exists "likes insert own" on public.photo_likes;
create policy "likes insert own"
  on public.photo_likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "likes delete own" on public.photo_likes;
create policy "likes delete own"
  on public.photo_likes
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Table: user_follows
-- Represents follow relationships between users. The composite primary key
-- prevents duplicates. Only the follower can create or remove a follow.
create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table public.user_follows enable row level security;

drop policy if exists "follows select" on public.user_follows;
create policy "follows select"
  on public.user_follows
  for select
  to authenticated
  using (true);

drop policy if exists "follows insert own" on public.user_follows;
create policy "follows insert own"
  on public.user_follows
  for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "follows delete own" on public.user_follows;
create policy "follows delete own"
  on public.user_follows
  for delete
  to authenticated
  using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- Table: premium_plans
-- Stores pricing information and descriptions for premium subscription plans.
-- Admins manage these entries; regular users can only read them. Prices are
-- stored as numeric for currency accuracy.
create table if not exists public.premium_plans (
  plan text primary key,
  price numeric not null,
  currency text not null default 'GBP',
  description text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.premium_plans enable row level security;

drop policy if exists "plans select" on public.premium_plans;
create policy "plans select"
  on public.premium_plans
  for select
  to authenticated
  using (true);

drop policy if exists "plans upsert admin" on public.premium_plans;
create policy "plans upsert admin"
  on public.premium_plans
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Trigger to update updated_at on changes
create or replace function public.set_premium_plans_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists premium_plans_set_updated_at on public.premium_plans;
create trigger premium_plans_set_updated_at
before update on public.premium_plans
for each row
execute function public.set_premium_plans_updated_at();