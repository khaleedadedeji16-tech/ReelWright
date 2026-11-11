-- 0002: profiles (one row per user) and the admin check used by every policy.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 100),
  -- Empty (null) until the user picks a role.
  role public.user_role,
  is_admin boolean not null default false,
  time_zone text not null default 'UTC',
  -- Plain text for now; the plans table arrives in step 7.
  plan text not null default 'free',
  -- Fanvue users only. Only the status is stored, never ID documents.
  age_confirmed boolean not null default false,
  id_check_status public.id_check_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- True when the signed-in user is an admin. SECURITY DEFINER so that it
-- reads profiles directly and the policies below do not loop back on
-- the profiles table.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = (select auth.uid())),
    false
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

alter table public.profiles enable row level security;

create policy "profiles: read own or admin"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Users may change only these columns. is_admin, plan and id_check_status
-- are not in the list, so they can change only through server code that
-- uses the service role key. Profiles are created by the sign-up trigger
-- (migration 0005) and removed when the auth user is deleted.
revoke all on table public.profiles from public, anon, authenticated, service_role;
grant select on table public.profiles to authenticated;
grant update (display_name, role, time_zone, age_confirmed)
  on table public.profiles to authenticated;
grant all on table public.profiles to service_role;
