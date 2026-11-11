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
