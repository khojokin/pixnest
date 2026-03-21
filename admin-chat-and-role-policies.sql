create extension if not exists pgcrypto;

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_admin boolean := false;
begin
  if p_user_id is null then
    return false;
  end if;

  if to_regclass('public.profiles') is not null then
    select exists(
      select 1
      from public.profiles
      where id = p_user_id
        and (
          coalesce(site_admin, false) = true
          or coalesce(super_admin, false) = true
          or lower(coalesce(role, '')) in ('admin', 'founder')
        )
    ) into v_is_admin;
  end if;

  return coalesce(v_is_admin, false);
end;
$$;

grant execute on function public.is_admin(uuid) to authenticated, anon;

alter table if exists public.live_support_sessions enable row level security;
alter table if exists public.live_support_messages enable row level security;

drop policy if exists "admins read live support sessions" on public.live_support_sessions;
create policy "admins read live support sessions"
on public.live_support_sessions
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admins update live support sessions" on public.live_support_sessions;
create policy "admins update live support sessions"
on public.live_support_sessions
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admins read live support messages" on public.live_support_messages;
create policy "admins read live support messages"
on public.live_support_messages
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admins send live support messages" on public.live_support_messages;
create policy "admins send live support messages"
on public.live_support_messages
for insert
to authenticated
with check (public.is_admin(auth.uid()));
