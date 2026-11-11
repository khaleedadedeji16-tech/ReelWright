-- 0006: connected_accounts and scheduled_posts.

-- ---------------------------------------------------------------------
-- connected_accounts: a user's linked social account. No secrets in this
-- table; login tokens live in connected_account_secrets (migration 0007).
-- ---------------------------------------------------------------------
create table public.connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform public.social_platform not null,
  handle text not null,
  status public.connection_status not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, handle)
);

create index connected_accounts_user_id_idx on public.connected_accounts (user_id);
create index connected_accounts_status_idx on public.connected_accounts (status);

create trigger connected_accounts_set_updated_at
  before update on public.connected_accounts
  for each row execute function public.set_updated_at();

alter table public.connected_accounts enable row level security;

create policy "connected_accounts: read own or admin"
  on public.connected_accounts for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "connected_accounts: delete own"
  on public.connected_accounts for delete to authenticated
  using (user_id = (select auth.uid()));

-- Users can see and remove (disconnect) their own accounts. Linking and
-- updating is server code only, because it handles the login tokens.
revoke all on table public.connected_accounts from public, anon, authenticated, service_role;
grant select, delete on table public.connected_accounts to authenticated;
grant all on table public.connected_accounts to service_role;

-- ---------------------------------------------------------------------
-- scheduled_posts: a post to publish.
-- Users write the content and choose draft or scheduled. The server sets
-- posting / posted / failed, safety_status, post_url and error_message.
-- ---------------------------------------------------------------------
create table public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_id uuid references public.files (id) on delete set null,
  caption text not null default '',
  hashtags text[] not null default '{}',
  platforms public.social_platform[] not null default '{}',
  -- The moment to post, plus the time zone name the user picked it in
  -- (for example Europe/London) so it can be shown back correctly.
  scheduled_at timestamptz,
  time_zone text not null default 'UTC',
  status public.post_status not null default 'draft',
  safety_status public.safety_status not null default 'not_checked',
  post_url text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_posts_needs_time
    check (status = 'draft' or scheduled_at is not null)
);

create index scheduled_posts_user_id_idx on public.scheduled_posts (user_id);
create index scheduled_posts_user_id_status_idx on public.scheduled_posts (user_id, status);
-- For the worker that finds posts that are due.
create index scheduled_posts_due_idx on public.scheduled_posts (status, scheduled_at);
create index scheduled_posts_file_id_idx on public.scheduled_posts (file_id);

create trigger scheduled_posts_set_updated_at
  before update on public.scheduled_posts
  for each row execute function public.set_updated_at();

-- If what will be posted changes, it must be safety-checked again. (An
-- update that sets safety_status in the same statement, i.e. the server
-- recording a check result, is left alone.)
create function public.scheduled_posts_reset_safety()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.safety_status = old.safety_status and (
    new.file_id is distinct from old.file_id
    or new.caption is distinct from old.caption
    or new.hashtags is distinct from old.hashtags
  ) then
    new.safety_status := 'not_checked';
  end if;
  return new;
end;
$$;

revoke execute on function public.scheduled_posts_reset_safety() from public, anon, authenticated;

create trigger scheduled_posts_reset_safety
  before update on public.scheduled_posts
  for each row execute function public.scheduled_posts_reset_safety();

alter table public.scheduled_posts enable row level security;

create policy "scheduled_posts: read own or admin"
  on public.scheduled_posts for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "scheduled_posts: insert own"
  on public.scheduled_posts for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status in ('draft', 'scheduled')
    and public.owns_file(file_id)
  );

-- A post can be edited until the server starts posting it, and again if
-- it failed. The user can only leave it as draft or scheduled.
create policy "scheduled_posts: update own"
  on public.scheduled_posts for update to authenticated
  using (
    user_id = (select auth.uid())
    and status in ('draft', 'scheduled', 'failed')
  )
  with check (
    user_id = (select auth.uid())
    and status in ('draft', 'scheduled')
    and public.owns_file(file_id)
  );

create policy "scheduled_posts: delete own"
  on public.scheduled_posts for delete to authenticated
  using (user_id = (select auth.uid()) and status <> 'posting');

-- Users can write only the content columns.
revoke all on table public.scheduled_posts from public, anon, authenticated, service_role;
grant select, delete on table public.scheduled_posts to authenticated;
grant insert (id, user_id, file_id, caption, hashtags, platforms, scheduled_at, time_zone, status)
  on table public.scheduled_posts to authenticated;
grant update (file_id, caption, hashtags, platforms, scheduled_at, time_zone, status)
  on table public.scheduled_posts to authenticated;
grant all on table public.scheduled_posts to service_role;
