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
