-- ReelWright: the whole database in one file.
-- GENERATED from supabase/migrations by `npm run db:combine`. Do not edit by hand.
--
-- For a FRESH Supabase project only: paste all of this into the SQL Editor
-- and run it once. It runs as one transaction, so if anything fails,
-- nothing is changed.

begin;

-- ====================================================================
-- 0001_enums_and_helpers.sql
-- ====================================================================

-- 0001: enums (fixed lists) and the shared updated_at trigger function.

-- People
create type public.user_role as enum ('author', 'creator', 'fanvue');
create type public.id_check_status as enum ('not_started', 'pending', 'passed', 'failed');

-- Creative work
create type public.book_status as enum ('draft', 'ready', 'archived');
create type public.persona_kind as enum ('verified_self', 'ai_character');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.project_kind as enum (
  'trailer', 'short_video', 'image_post', 'carousel', 'thumbnail',
  'feed_post', 'paid_set', 'clip', 'teaser'
);
create type public.project_status as enum ('draft', 'in_progress', 'completed', 'archived');
create type public.aspect_ratio as enum ('16:9', '9:16', '1:1', '4:5');
create type public.scene_status as enum ('draft', 'generating', 'ready', 'failed');
create type public.file_kind as enum (
  'manuscript', 'cover', 'reference_image', 'keyframe', 'video_clip',
  'final_video', 'image', 'audio', 'other'
);
create type public.safety_status as enum ('not_checked', 'passed', 'held', 'blocked');

-- Generation
create type public.workflow_kind as enum ('image', 'video_shot');
create type public.job_kind as enum ('image', 'video_shot', 'assemble');
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');
create type public.gpu_source as enum ('site', 'own_runpod', 'own_pc');
create type public.gpu_provider as enum ('runpod', 'own_pc');
-- Shared by gpu_connections and connected_accounts.
create type public.connection_status as enum ('pending', 'active', 'expired', 'error', 'revoked');

-- Money
create type public.credit_transaction_kind as enum (
  'purchase', 'hold', 'charge', 'release', 'refund', 'grant'
);

-- Publishing
create type public.social_platform as enum (
  'instagram', 'tiktok', 'youtube', 'facebook', 'x', 'fanvue'
);
create type public.post_status as enum ('draft', 'scheduled', 'posting', 'posted', 'failed');

-- Keeps updated_at current. Attached to every table as a trigger.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ====================================================================
-- 0002_profiles.sql
-- ====================================================================

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

-- ====================================================================
-- 0003_creative_work.sql
-- ====================================================================

-- 0003: files, books, characters, personas, projects, scenes.

-- ---------------------------------------------------------------------
-- files: every uploaded or generated file. The file itself will live in
-- Cloudflare R2; only its key is stored here. No Supabase storage buckets.
-- ---------------------------------------------------------------------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.file_kind not null,
  storage_key text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  width integer check (width > 0),
  height integer check (height > 0),
  duration_seconds numeric(10, 3) check (duration_seconds >= 0),
  safety_status public.safety_status not null default 'not_checked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index files_user_id_idx on public.files (user_id);
create index files_user_id_kind_idx on public.files (user_id, kind);
create index files_safety_status_idx on public.files (safety_status);

create trigger files_set_updated_at
  before update on public.files
  for each row execute function public.set_updated_at();

alter table public.files enable row level security;

create policy "files: read own or admin"
  on public.files for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Read-only for users. Rows are created and removed by server code, which
-- is what issues the storage key and sets safety_status. This stops a user
-- pointing a row at someone else's stored file.
revoke all on table public.files from public, anon, authenticated, service_role;
grant select on table public.files to authenticated;
grant all on table public.files to service_role;

-- True when the id is empty or is one of the signed-in user's own files.
-- Used by policies so a row can only link to files its owner owns.
create function public.owns_file(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.files f
    where f.id = target_id and f.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_file(uuid) from public, anon;
grant execute on function public.owns_file(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- books: an author's book.
-- ---------------------------------------------------------------------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  author_name text,
  genre text,
  mood text,
  summary text,
  manuscript_file_id uuid references public.files (id) on delete set null,
  cover_file_id uuid references public.files (id) on delete set null,
  status public.book_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index books_user_id_idx on public.books (user_id);
create index books_user_id_status_idx on public.books (user_id, status);
create index books_manuscript_file_id_idx on public.books (manuscript_file_id);
create index books_cover_file_id_idx on public.books (cover_file_id);

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

create function public.owns_book(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.books b
    where b.id = target_id and b.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_book(uuid) from public, anon;
grant execute on function public.owns_book(uuid) to authenticated, service_role;

alter table public.books enable row level security;

create policy "books: read own or admin"
  on public.books for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "books: insert own"
  on public.books for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_file(manuscript_file_id)
    and public.owns_file(cover_file_id)
  );

create policy "books: update own"
  on public.books for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_file(manuscript_file_id)
    and public.owns_file(cover_file_id)
  );

create policy "books: delete own"
  on public.books for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.books from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.books to authenticated;
grant all on table public.books to service_role;

-- ---------------------------------------------------------------------
-- characters: saved characters for the library.
-- ---------------------------------------------------------------------
create table public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id uuid references public.books (id) on delete set null,
  name text not null,
  description text,
  reference_file_id uuid references public.files (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index characters_user_id_idx on public.characters (user_id);
create index characters_book_id_idx on public.characters (book_id);
create index characters_reference_file_id_idx on public.characters (reference_file_id);

create trigger characters_set_updated_at
  before update on public.characters
  for each row execute function public.set_updated_at();

alter table public.characters enable row level security;

create policy "characters: read own or admin"
  on public.characters for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "characters: insert own"
  on public.characters for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_file(reference_file_id)
  );

create policy "characters: update own"
  on public.characters for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_file(reference_file_id)
  );

create policy "characters: delete own"
  on public.characters for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.characters from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.characters to authenticated;
grant all on table public.characters to service_role;

-- ---------------------------------------------------------------------
-- personas: Fanvue personas. approval_status is set by server code only.
-- ---------------------------------------------------------------------
create table public.personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind public.persona_kind not null,
  look_description text,
  reference_file_id uuid references public.files (id) on delete set null,
  approval_status public.approval_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index personas_user_id_idx on public.personas (user_id);
create index personas_approval_status_idx on public.personas (approval_status);
create index personas_reference_file_id_idx on public.personas (reference_file_id);

create trigger personas_set_updated_at
  before update on public.personas
  for each row execute function public.set_updated_at();

-- If the persona itself is edited, it must be approved again. (An update
-- that sets approval_status in the same statement, i.e. the server
-- approving or rejecting, is left alone.)
create function public.personas_reset_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.approval_status = old.approval_status and (
    new.name is distinct from old.name
    or new.kind is distinct from old.kind
    or new.look_description is distinct from old.look_description
    or new.reference_file_id is distinct from old.reference_file_id
  ) then
    new.approval_status := 'pending';
  end if;
  return new;
end;
$$;

revoke execute on function public.personas_reset_approval() from public, anon, authenticated;

create trigger personas_reset_approval
  before update on public.personas
  for each row execute function public.personas_reset_approval();

create function public.owns_persona(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.personas p
    where p.id = target_id and p.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_persona(uuid) from public, anon;
grant execute on function public.owns_persona(uuid) to authenticated, service_role;

alter table public.personas enable row level security;

create policy "personas: read own or admin"
  on public.personas for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "personas: insert own"
  on public.personas for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_file(reference_file_id)
  );

create policy "personas: update own"
  on public.personas for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_file(reference_file_id)
  );

create policy "personas: delete own"
  on public.personas for delete to authenticated
  using (user_id = (select auth.uid()));

-- Users can write every column except approval_status.
revoke all on table public.personas from public, anon, authenticated, service_role;
grant select, delete on table public.personas to authenticated;
grant insert (id, user_id, name, kind, look_description, reference_file_id)
  on table public.personas to authenticated;
grant update (name, kind, look_description, reference_file_id)
  on table public.personas to authenticated;
grant all on table public.personas to service_role;

-- ---------------------------------------------------------------------
-- projects: one piece of work.
-- ---------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.project_kind not null,
  title text not null,
  status public.project_status not null default 'draft',
  target_length_seconds integer check (target_length_seconds > 0),
  aspect_ratio public.aspect_ratio,
  -- Which step of the creation flow the user is on. Free text for now;
  -- the steps are defined when the flows are built.
  current_step text,
  book_id uuid references public.books (id) on delete set null,
  persona_id uuid references public.personas (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);
create index projects_user_id_status_idx on public.projects (user_id, status);
create index projects_book_id_idx on public.projects (book_id);
create index projects_persona_id_idx on public.projects (persona_id);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create function public.owns_project(target_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select target_id is null or exists (
    select 1 from public.projects p
    where p.id = target_id and p.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_project(uuid) from public, anon;
grant execute on function public.owns_project(uuid) to authenticated, service_role;

alter table public.projects enable row level security;

create policy "projects: read own or admin"
  on public.projects for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "projects: insert own"
  on public.projects for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_persona(persona_id)
  );

create policy "projects: update own"
  on public.projects for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_book(book_id)
    and public.owns_persona(persona_id)
  );

create policy "projects: delete own"
  on public.projects for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.projects from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.projects to authenticated;
grant all on table public.projects to service_role;

-- ---------------------------------------------------------------------
-- scenes: the storyboard rows of a project.
-- ---------------------------------------------------------------------
create table public.scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  position integer not null check (position >= 0),
  prompt text,
  voiceover_line text,
  length_seconds numeric(6, 2) check (length_seconds > 0),
  keyframe_file_id uuid references public.files (id) on delete set null,
  video_file_id uuid references public.files (id) on delete set null,
  status public.scene_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenes_user_id_idx on public.scenes (user_id);
create index scenes_project_id_position_idx on public.scenes (project_id, position);
create index scenes_status_idx on public.scenes (status);
create index scenes_keyframe_file_id_idx on public.scenes (keyframe_file_id);
create index scenes_video_file_id_idx on public.scenes (video_file_id);

create trigger scenes_set_updated_at
  before update on public.scenes
  for each row execute function public.set_updated_at();

alter table public.scenes enable row level security;

create policy "scenes: read own or admin"
  on public.scenes for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "scenes: insert own"
  on public.scenes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.owns_project(project_id)
    and public.owns_file(keyframe_file_id)
    and public.owns_file(video_file_id)
  );

create policy "scenes: update own"
  on public.scenes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.owns_project(project_id)
    and public.owns_file(keyframe_file_id)
    and public.owns_file(video_file_id)
  );

create policy "scenes: delete own"
  on public.scenes for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.scenes from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.scenes to authenticated;
grant all on table public.scenes to service_role;

-- ====================================================================
-- 0004_generation.sql
-- ====================================================================

-- 0004: workflow_templates, jobs, gpu_connections.

-- ---------------------------------------------------------------------
-- workflow_templates: the ComfyUI workflows the admin uploads.
-- Admins can do everything; nobody else can read them.
-- ---------------------------------------------------------------------
create table public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind public.workflow_kind not null,
  version integer not null default 1 check (version > 0),
  workflow jsonb not null,
  input_map jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, version)
);

create index workflow_templates_kind_active_idx
  on public.workflow_templates (kind, is_active);

create trigger workflow_templates_set_updated_at
  before update on public.workflow_templates
  for each row execute function public.set_updated_at();

alter table public.workflow_templates enable row level security;

create policy "workflow_templates: admin everything"
  on public.workflow_templates for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on table public.workflow_templates from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.workflow_templates to authenticated;
grant all on table public.workflow_templates to service_role;

-- ---------------------------------------------------------------------
-- jobs: one generation job. Users can read their own jobs. Everything
-- else (creating, status, cost, GPU seconds, credits) is server code only.
-- ---------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Jobs are kept as a cost record even if the project or scene is deleted.
  project_id uuid references public.projects (id) on delete set null,
  scene_id uuid references public.scenes (id) on delete set null,
  workflow_template_id uuid references public.workflow_templates (id) on delete set null,
  kind public.job_kind not null,
  status public.job_status not null default 'queued',
  gpu_source public.gpu_source not null default 'site',
  priority integer not null default 0,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  -- The values sent into the workflow (prompt, seed, sizes and so on).
  input jsonb not null default '{}'::jsonb,
  -- The file the job produced, once it succeeds.
  output_file_id uuid references public.files (id) on delete set null,
  -- The job's id on the GPU provider (for example the RunPod job id).
  external_id text,
  gpu_seconds numeric(12, 3) not null default 0 check (gpu_seconds >= 0),
  cost_usd numeric(12, 4) not null default 0 check (cost_usd >= 0),
  credits_held bigint not null default 0 check (credits_held >= 0),
  credits_charged bigint not null default 0 check (credits_charged >= 0),
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index jobs_user_id_idx on public.jobs (user_id);
create index jobs_user_id_status_idx on public.jobs (user_id, status);
-- For the worker that picks the next queued job.
create index jobs_queue_idx on public.jobs (status, priority desc, created_at);
create index jobs_project_id_idx on public.jobs (project_id);
create index jobs_scene_id_idx on public.jobs (scene_id);
create index jobs_workflow_template_id_idx on public.jobs (workflow_template_id);
create index jobs_output_file_id_idx on public.jobs (output_file_id);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;

create policy "jobs: read own or admin"
  on public.jobs for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

revoke all on table public.jobs from public, anon, authenticated, service_role;
grant select on table public.jobs to authenticated;
grant all on table public.jobs to service_role;

-- ---------------------------------------------------------------------
-- gpu_connections: a user's own GPU setup. No secrets in this table;
-- the API key lives in gpu_connection_secrets (migration 0007).
-- ---------------------------------------------------------------------
create table public.gpu_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider public.gpu_provider not null,
  status public.connection_status not null default 'pending',
  endpoint_id text,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index gpu_connections_user_id_idx on public.gpu_connections (user_id);
create index gpu_connections_status_idx on public.gpu_connections (status);

create trigger gpu_connections_set_updated_at
  before update on public.gpu_connections
  for each row execute function public.set_updated_at();

alter table public.gpu_connections enable row level security;

create policy "gpu_connections: read own or admin"
  on public.gpu_connections for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "gpu_connections: delete own"
  on public.gpu_connections for delete to authenticated
  using (user_id = (select auth.uid()));

-- Users can see and remove (disconnect) their own connections. Creating
-- and updating is server code only, because it has to store the secret
-- key and check the connection at the same time.
revoke all on table public.gpu_connections from public, anon, authenticated, service_role;
grant select, delete on table public.gpu_connections to authenticated;
grant all on table public.gpu_connections to service_role;

-- ====================================================================
-- 0005_money.sql
-- ====================================================================

-- 0005: credit_wallets, credit_transactions, and the sign-up trigger.
-- Users can read their own wallet and ledger and nothing more. Every
-- change is made by server code using the service role key.

-- ---------------------------------------------------------------------
-- credit_wallets: one per user.
-- balance = all credits the user owns, including held ones.
-- held    = the part of the balance reserved for jobs that are running.
-- Credits available to spend = balance - held.
-- ---------------------------------------------------------------------
create table public.credit_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  held bigint not null default 0 check (held >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_wallets_held_within_balance check (held <= balance)
);

create trigger credit_wallets_set_updated_at
  before update on public.credit_wallets
  for each row execute function public.set_updated_at();

alter table public.credit_wallets enable row level security;

create policy "credit_wallets: read own or admin"
  on public.credit_wallets for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

revoke all on table public.credit_wallets from public, anon, authenticated, service_role;
grant select on table public.credit_wallets to authenticated;
grant all on table public.credit_wallets to service_role;

-- ---------------------------------------------------------------------
-- credit_transactions: the ledger. Rows are never edited or deleted:
-- even the service role may only read and add rows.
-- amount is always a positive number of credits; kind says what happened:
--   purchase, grant, refund -> added to balance
--   hold                    -> moved into held
--   release                 -> moved back out of held
--   charge                  -> taken from held and from balance
-- ---------------------------------------------------------------------
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount bigint not null check (amount > 0),
  kind public.credit_transaction_kind not null,
  job_id uuid references public.jobs (id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index credit_transactions_user_id_created_at_idx
  on public.credit_transactions (user_id, created_at desc);
create index credit_transactions_job_id_idx on public.credit_transactions (job_id);
create index credit_transactions_kind_idx on public.credit_transactions (kind);

create trigger credit_transactions_set_updated_at
  before update on public.credit_transactions
  for each row execute function public.set_updated_at();

alter table public.credit_transactions enable row level security;

create policy "credit_transactions: read own or admin"
  on public.credit_transactions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

revoke all on table public.credit_transactions from public, anon, authenticated, service_role;
grant select on table public.credit_transactions to authenticated;
grant select, insert on table public.credit_transactions to service_role;

-- ---------------------------------------------------------------------
-- When a new user signs up, create their profile and credit wallet.
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(trim(coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )), 100), '')
  )
  on conflict (id) do nothing;

  insert into public.credit_wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cover any users who signed up before this migration was run.
insert into public.profiles (id)
select u.id from auth.users u
on conflict (id) do nothing;

insert into public.credit_wallets (user_id)
select u.id from auth.users u
on conflict (user_id) do nothing;

-- ====================================================================
-- 0006_publishing.sql
-- ====================================================================

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

-- ====================================================================
-- 0007_secrets.sql
-- ====================================================================

-- 0007: secrets tables.
-- Row level security is ON and there are NO policies, on purpose, and the
-- browser roles have no access at all. Only server code using the service
-- role key can touch these tables.
-- The values are stored as given for now; encrypting them is step 8.

create table public.gpu_connection_secrets (
  id uuid primary key default gen_random_uuid(),
  gpu_connection_id uuid not null unique
    references public.gpu_connections (id) on delete cascade,
  api_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger gpu_connection_secrets_set_updated_at
  before update on public.gpu_connection_secrets
  for each row execute function public.set_updated_at();

alter table public.gpu_connection_secrets enable row level security;

revoke all on table public.gpu_connection_secrets from public, anon, authenticated, service_role;
grant all on table public.gpu_connection_secrets to service_role;

create table public.connected_account_secrets (
  id uuid primary key default gen_random_uuid(),
  connected_account_id uuid not null unique
    references public.connected_accounts (id) on delete cascade,
  access_token text not null,
  refresh_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger connected_account_secrets_set_updated_at
  before update on public.connected_account_secrets
  for each row execute function public.set_updated_at();

alter table public.connected_account_secrets enable row level security;

revoke all on table public.connected_account_secrets from public, anon, authenticated, service_role;
grant all on table public.connected_account_secrets to service_role;

commit;
