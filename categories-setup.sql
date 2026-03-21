create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text default '',
  is_active boolean not null default true,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories"
on public.categories
for select
to public
using (is_active = true or public.is_admin(auth.uid()));

drop policy if exists "admins insert categories" on public.categories;
create policy "admins insert categories"
on public.categories
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "admins update categories" on public.categories;
create policy "admins update categories"
on public.categories
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create or replace function public.set_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_categories_updated_at();
