begin;

create extension if not exists pgcrypto;

create table if not exists public.account_deletion_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table public.account_deletion_feedback enable row level security;

drop policy if exists "users insert own account deletion feedback" on public.account_deletion_feedback;
create policy "users insert own account deletion feedback"
on public.account_deletion_feedback
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users read own account deletion feedback" on public.account_deletion_feedback;
create policy "users read own account deletion feedback"
on public.account_deletion_feedback
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.request_self_account_deletion(reason_text text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := '';
  v_is_admin boolean := false;
  v_where text := '';
begin
  if v_uid is null then
    raise exception 'You need to be logged in.';
  end if;

  select coalesce(email, '')
  into v_email
  from auth.users
  where id = v_uid;

  if to_regclass('public.profiles') is not null then
    execute $q$
      select exists (
        select 1
        from public.profiles
        where id = $1
          and (
            coalesce(site_admin, false) = true
            or coalesce(super_admin, false) = true
            or lower(coalesce(role, '')) in ('admin', 'founder')
          )
      )
    $q$
    into v_is_admin
    using v_uid;
  end if;

  if not v_is_admin then
    v_is_admin := coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false)
      or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) in ('admin', 'founder');
  end if;

  if v_is_admin then
    raise exception 'Admin accounts cannot be deleted from this form.';
  end if;

  insert into public.account_deletion_feedback (user_id, email, reason)
  values (v_uid, v_email, coalesce(reason_text, ''));

  if to_regclass('public.creator_profiles') is not null then
    execute 'delete from public.creator_profiles where user_id::text = $1::text' using v_uid::text;
  end if;

  if to_regclass('public.photos') is not null then
    v_where := '';

    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'uploaded_by') then
      v_where := v_where || ' or uploaded_by::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'user_id') then
      v_where := v_where || ' or user_id::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'auth_user_id') then
      v_where := v_where || ' or auth_user_id::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'profile_id') then
      v_where := v_where || ' or profile_id::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'repost_user_id') then
      v_where := v_where || ' or repost_user_id::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'reposted_by_id') then
      v_where := v_where || ' or reposted_by_id::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'seller_user_id') then
      v_where := v_where || ' or seller_user_id::text = $1::text';
    end if;
    if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'photos' and column_name = 'creator_id') then
      v_where := v_where || ' or creator_id::text = $1::text';
    end if;

    if v_where <> '' then
      execute 'delete from public.photos where false' || v_where using v_uid::text;
    end if;
  end if;

  delete from auth.users where id = v_uid;

  return jsonb_build_object(
    'success', true,
    'message', 'Your account has been deleted.'
  );
end;
$$;

grant execute on function public.request_self_account_deletion(text) to authenticated;
revoke execute on function public.request_self_account_deletion(text) from anon, public;

commit;
