-- 0008: role and age_confirmed become server-only; age_confirmed_at is
-- added; linkedin and reddit join the social platform list.

-- Users can no longer set or change role or age_confirmed themselves.
-- From the browser they may now update only display_name and time_zone.
-- The role is set once, during onboarding, by server code.
revoke update (role, age_confirmed) on table public.profiles from authenticated;

-- When the user confirmed they are 18 or older (a self-declaration only).
alter table public.profiles add column age_confirmed_at timestamptz;

update public.profiles
set age_confirmed_at = updated_at
where age_confirmed and age_confirmed_at is null;

alter table public.profiles
  add constraint profiles_age_confirmed_has_time
  check (not age_confirmed or age_confirmed_at is not null);

alter type public.social_platform add value if not exists 'linkedin';
alter type public.social_platform add value if not exists 'reddit';
