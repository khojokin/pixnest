begin;

drop trigger if exists profiles_limit_identity_insert on public.profiles;
drop function if exists public.limit_identity_reuse();

create or replace function public.before_user_created_limit_accounts(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return '{}'::jsonb;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.before_user_created_limit_accounts(jsonb) to supabase_auth_admin;
revoke execute on function public.before_user_created_limit_accounts(jsonb) from anon, authenticated, public;

update public.profiles
set
  role = 'founder',
  badge = 'Founder',
  site_admin = true,
  super_admin = true,
  is_verified = true,
  premium_member = true,
  creator_approved = true,
  dashboard_enabled = true,
  followers_count = 12000000,
  updated_at = now()
where lower(coalesce(email, '')) in (
  'kingsfordkojo7@icloud.com',
  'kingsfordkojo7@gmail.com'
);

update public.creator_profiles
set
  verified = true,
  premium_member = true,
  creator_approved = true,
  professional_dashboard_approved = true,
  payout_enabled = true,
  followers_count = 12000000,
  updated_at = now()
where lower(coalesce(email, '')) in (
  'kingsfordkojo7@icloud.com',
  'kingsfordkojo7@gmail.com'
);

update public.creator_store_access
set
  followers_count = 12000000,
  admin_approved = true,
  updated_at = now()
where creator_user_id in (
  select id
  from public.profiles
  where lower(coalesce(email, '')) in (
    'kingsfordkojo7@icloud.com',
    'kingsfordkojo7@gmail.com'
  )
);

commit;
