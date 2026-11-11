# ReelWright

This file is the project memory. Read it before every step.

@AGENTS.md

## What the app is

ReelWright is a platform where three kinds of users — **authors**, **content
creators**, and **Fanvue creators** — generate AI images and videos through
ComfyUI on RunPod, then schedule them to post on social platforms.

- Each role gets its own dashboard.
- There is an admin area, which includes demo versions of the three
  dashboards filled with mock data.

The app is built in 12 steps, one at a time. Step 1 (project setup) is done.

## Tech stack

- Next.js 16 (App Router) with TypeScript in strict mode
- Tailwind CSS 4
- Supabase for database and login, via `@supabase/supabase-js` and
  `@supabase/ssr`
- Hosted on Vercel, code on GitHub
- Package manager: npm

Next.js 16 differs from older versions (see the note imported from
AGENTS.md above). Check the docs in `node_modules/next/dist/docs/` before
using an API. `cacheComponents` is switched on in `next.config.ts`, so
request-time data (for example `cookies()`, which the Supabase server
client uses) must be read inside a `<Suspense>` boundary.

## Folder structure

```
app/
  (marketing)/        public pages (the home page lives here)
  (auth)/             login and sign-up
  (dashboard)/
    author/           author dashboard
    creator/          content creator dashboard
    fanvue/           Fanvue creator dashboard
  admin/              admin area
    demo/             demo dashboards (mock data)
components/
  ui/                 small reusable pieces (buttons, cards)
  dashboard/          dashboard display components
lib/
  supabase/           Supabase client helpers (browser and server)
  demo-data/          the ONLY place mock data may live
```

Folders in brackets, like `(marketing)`, are route groups: they organise
files and do not appear in the URL. Empty folders hold a `.gitkeep` file
so git tracks them; delete it when the folder gets real files.

### Supabase helpers

- `lib/supabase/client.ts` — `createClient()` for Client Components.
- `lib/supabase/server.ts` — `await createClient()` for Server Components,
  Server Functions and Route Handlers.
- `lib/supabase/env.ts` — reads the environment variables;
  `hasSupabaseEnv()` reports whether they are set without exposing them.

Session refresh on each request (Next.js `proxy.ts`) is not set up yet; it
belongs with the login step.

### Environment variables

Listed in `.env.example`. Real values go in `.env.local` (ignored by git)
and in the Vercel project settings.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

When a later step needs a new variable, add it to `.env.example` with an
empty value and list it here.

## Rules (apply to every step)

1. **One dashboard, two data sources.** Each dashboard is built as display
   components that only show the data they are given. Real pages pass
   database data; admin demo pages pass mock data to the same components.
2. **Mock data lives only in `lib/demo-data`** and is only imported by
   pages under `app/admin/demo`. Real user pages never use mock data.
3. **All colours come from named design tokens** with a light and a dark
   value. No hard-coded colour values in components. (The tokens
   themselves are built in step 2. Until then only the scaffold's
   `background` and `foreground` tokens in `app/globals.css` exist.)
4. **Build only what the current step asks for.** If something seems
   missing, ask instead of adding it.
5. **Never commit secrets.** Keys live in `.env.local` only.
6. **Before saying a step is done, run the linter and a production build
   and fix any errors.**

## Commands

- `npm run dev` — start the local dev server
- `npm run lint` — run the linter
- `npm run build` — production build
