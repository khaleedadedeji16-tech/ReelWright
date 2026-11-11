-- Lists every table in the public schema with whether row level security
-- is on and how many policies it has. Run this after the migrations.
--
-- What to expect:
--   * rls_enabled is true on every row.
--   * gpu_connection_secrets and connected_account_secrets have 0
--     policies. That is on purpose: nobody but server code can read them.
--   * Every other table has at least 1 policy.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  count(p.polname) as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relname;
