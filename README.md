# ReelWright

A platform where authors, content creators and Fanvue creators generate AI
images and videos, then schedule them to post on social platforms.

Built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase.

## Run locally

You need Node.js 20.9 or newer.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and fill in your Supabase project URL, anon key and
   service role key.
   This file is ignored by git; never commit real keys.

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000. The home page shows whether the Supabase
   variables were found.

## Database

The database is defined by the SQL files in `supabase/`. Nothing is applied
automatically; run the SQL yourself in the Supabase dashboard.

Setting up a fresh Supabase project:

1. In the Supabase dashboard open **SQL Editor** and start a new query.
2. Paste in the whole of `supabase/all-in-one.sql` and click **Run**. It
   runs as one transaction, so if anything fails nothing is changed.
3. Paste in `supabase/verify.sql` and run it. Every table should show
   `rls_enabled` as true. The two `_secrets` tables show 0 policies on
   purpose; every other table shows at least 1.

Later changes arrive as new numbered files in `supabase/migrations`. Run
only the new file(s), in order.

### Make a user an admin

Run this in the SQL Editor after that person has signed up, with their
email address in place of the example:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

It should report 1 row updated. To remove admin rights, run it again with
`false`.

## Other commands

- `npm run lint` — check the code with the linter
- `npm run build` — make a production build
- `npm run start` — run the production build
- `npm run db:combine` — rebuild `supabase/all-in-one.sql` from the
  migration files

## Project notes

Structure and project rules are in [CLAUDE.md](./CLAUDE.md).
