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
