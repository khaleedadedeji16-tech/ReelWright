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

   Open `.env.local` and fill in your Supabase project URL and anon key.
   This file is ignored by git; never commit real keys.

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000. The home page shows whether the Supabase
   variables were found.

## Other commands

- `npm run lint` — check the code with the linter
- `npm run build` — make a production build
- `npm run start` — run the production build

## Project notes

Structure and project rules are in [CLAUDE.md](./CLAUDE.md).
