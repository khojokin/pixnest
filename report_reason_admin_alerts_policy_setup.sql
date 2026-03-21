create extension if not exists pgcrypto;

create table if not exists public.report_reason_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  applies_to text not null default 'post',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.report_reason_types (code, label, applies_to, sort_order)
values
  ('spam', 'Spam or misleading', 'post', 1),
  ('nudity', 'Nudity or sexual content', 'post', 2),
  ('violence', 'Violent or graphic content', 'post', 3),
  ('hate', 'Hate or abusive content', 'post', 4),
  ('harassment', 'Harassment or bullying', 'post', 5),
  ('copyright', 'Copyright infringement', 'post', 6),
  ('illegal', 'Illegal or dangerous content', 'post', 7),
  ('scam', 'Scam or fraud', 'post', 8),
  ('fake', 'Fake account or impersonation', 'user', 9),
  ('other', 'Other', 'post', 10)
on conflict (code) do nothing;

alter table public.post_reports
  add column if not exists report_type text not null default 'post',
  add column if not exists target_user_id uuid,
  add column if not exists photo_owner_user_id uuid,
  add column if not exists reason_code text,
  add column if not exists admin_notes text,
  add column if not exists reviewed_by uuid,
  add column if not exists reviewed_at timestamptz,
  add column if not exists resolution text default 'pending',
  add column if not exists severity text default 'medium',
  add column if not exists evidence text,
  add column if not exists violation_confirmed boolean not null default false;

create index if not exists idx_post_reports_photo_id on public.post_reports(photo_id);
create index if not exists idx_post_reports_target_user_id on public.post_reports(target_user_id);
create index if not exists idx_post_reports_resolution on public.post_reports(resolution);
create index if not exists idx_post_reports_created_at on public.post_reports(created_at);

create table if not exists public.admin_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  title text not null,
  message text not null,
  related_table text,
  related_id text,
  target_user_id uuid,
  photo_id text,
  is_read boolean not null default false,
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_admin_alerts_is_read on public.admin_alerts(is_read);
create index if not exists idx_admin_alerts_created_at on public.admin_alerts(created_at desc);

alter table public.admin_alerts enable row level security;

drop policy if exists "admins can read admin alerts" on public.admin_alerts;
create policy "admins can read admin alerts"
on public.admin_alerts
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "system can insert admin alerts" on public.admin_alerts;
create policy "system can insert admin alerts"
on public.admin_alerts
for insert
to authenticated
with check (public.is_admin(auth.uid()) or auth.uid() is not null);

drop policy if exists "admins can update admin alerts" on public.admin_alerts;
create policy "admins can update admin alerts"
on public.admin_alerts
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create table if not exists public.user_policy_violations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  report_id uuid,
  violation_type text not null,
  severity text not null default 'medium',
  strike_count integer not null default 1,
  notes text,
  action_taken text default 'warning',
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_policy_violations_user_id on public.user_policy_violations(user_id);
create index if not exists idx_user_policy_violations_created_at on public.user_policy_violations(created_at desc);

alter table public.user_policy_violations enable row level security;

drop policy if exists "admins can read policy violations" on public.user_policy_violations;
create policy "admins can read policy violations"
on public.user_policy_violations
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "admins can insert policy violations" on public.user_policy_violations;
create policy "admins can insert policy violations"
on public.user_policy_violations
for insert
to authenticated
with check (public.is_admin(auth.uid()));

drop policy if exists "admins can update policy violations" on public.user_policy_violations;
create policy "admins can update policy violations"
on public.user_policy_violations
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create or replace function public.handle_new_report_create_admin_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_message text;
begin
  v_title := case
    when new.report_type = 'user' then 'User reported'
    else 'Content reported'
  end;

  v_message := case
    when new.report_type = 'user' then
      'A user has been reported. Reason: ' || coalesce(new.reason_code, new.reason)
    else
      'A post/photo has been reported. Reason: ' || coalesce(new.reason_code, new.reason)
  end;

  insert into public.admin_alerts (
    alert_type, title, message, related_table, related_id, target_user_id, photo_id, priority
  )
  values (
    'report_submitted', v_title, v_message, 'post_reports', new.id::text, new.target_user_id, new.photo_id,
    case when lower(coalesce(new.severity, 'medium')) = 'high' then 'high' else 'medium' end
  );

  return new;
end;
$$;

drop trigger if exists post_reports_admin_alert_trigger on public.post_reports;
create trigger post_reports_admin_alert_trigger
after insert on public.post_reports
for each row
execute function public.handle_new_report_create_admin_alert();

create or replace function public.admin_review_report(
  p_report_id uuid,
  p_resolution text,
  p_violation_confirmed boolean default false,
  p_action_taken text default 'warning',
  p_admin_notes text default null,
  p_severity text default 'medium'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target_user_id uuid;
  v_reason_code text;
  v_photo_id text;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Only admins can review reports.';
  end if;

  select target_user_id, reason_code, photo_id
  into v_target_user_id, v_reason_code, v_photo_id
  from public.post_reports
  where id = p_report_id;

  if not found then
    raise exception 'Report not found.';
  end if;

  update public.post_reports
  set resolution = p_resolution,
      violation_confirmed = coalesce(p_violation_confirmed, false),
      admin_notes = coalesce(p_admin_notes, admin_notes),
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      severity = coalesce(p_severity, severity)
  where id = p_report_id;

  if coalesce(p_violation_confirmed, false) = true and v_target_user_id is not null then
    insert into public.user_policy_violations (
      user_id, report_id, violation_type, severity, notes, action_taken, created_by
    ) values (
      v_target_user_id, p_report_id, coalesce(v_reason_code, 'policy_violation'), coalesce(p_severity, 'medium'), p_admin_notes, coalesce(p_action_taken, 'warning'), auth.uid()
    );

    insert into public.admin_alerts (
      alert_type, title, message, related_table, related_id, target_user_id, photo_id, priority
    ) values (
      'policy_violation_confirmed', 'Policy violation confirmed', 'A report was upheld and a violation record was created.', 'post_reports', p_report_id::text, v_target_user_id, v_photo_id,
      case when lower(coalesce(p_severity, 'medium')) = 'high' then 'high' else 'medium' end
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'report_id', p_report_id,
    'resolution', p_resolution,
    'violation_confirmed', p_violation_confirmed
  );
end;
$$;

grant execute on function public.admin_review_report(uuid, text, boolean, text, text, text) to authenticated;
revoke execute on function public.admin_review_report(uuid, text, boolean, text, text, text) from anon, public;

create or replace function public.handle_policy_violation_repeat_offender_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.user_policy_violations
  where user_id = new.user_id;

  if v_count >= 3 then
    insert into public.admin_alerts (
      alert_type, title, message, related_table, related_id, target_user_id, priority
    ) values (
      'repeat_offender', 'Repeat offender flagged', 'This user has reached ' || v_count || ' confirmed policy violations.', 'user_policy_violations', new.id::text, new.user_id, 'high'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists user_policy_violations_repeat_alert_trigger on public.user_policy_violations;
create trigger user_policy_violations_repeat_alert_trigger
after insert on public.user_policy_violations
for each row
execute function public.handle_policy_violation_repeat_offender_alert();

create or replace function public.get_unread_admin_alert_count()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if not public.is_admin(auth.uid()) then
    return 0;
  end if;

  select count(*) into v_count
  from public.admin_alerts
  where is_read = false;

  return coalesce(v_count, 0);
end;
$$;

grant execute on function public.get_unread_admin_alert_count() to authenticated;
revoke execute on function public.get_unread_admin_alert_count() from anon, public;
