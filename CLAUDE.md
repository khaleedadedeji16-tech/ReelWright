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

The app is built in 12 steps, one at a time. Done so far: step 1 (project
setup), step 2 (design system) and step 3 (database).

## Tech stack

- Next.js 16 (App Router) with TypeScript in strict mode
- Tailwind CSS 4
- next-themes for light and dark mode
- Supabase for database and login, via `@supabase/supabase-js` and
  `@supabase/ssr`
- Hosted on Vercel, code on GitHub
  - Live site: https://reel-wright.vercel.app (redeploys on every push to
    `main`)
  - Repository: https://github.com/khaleedadedeji16-tech/ReelWright
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
  supabase/           Supabase client helpers (browser, server, admin)
  demo-data/          the ONLY place mock data may live
  database.types.ts   TypeScript types that match the database
supabase/
  migrations/         numbered SQL files, in the order they must run
  all-in-one.sql      every migration in one file (generated)
  verify.sql          lists each table's security status
scripts/
  combine-migrations.mjs   builds all-in-one.sql (npm run db:combine)
```

Folders in brackets, like `(marketing)`, are route groups: they organise
files and do not appear in the URL. Empty folders hold a `.gitkeep` file
so git tracks them; delete it when the folder gets real files.

### Supabase helpers

- `lib/supabase/client.ts` — `createClient()` for Client Components.
- `lib/supabase/server.ts` — `await createClient()` for Server Components,
  Server Functions and Route Handlers.
- `lib/supabase/admin.ts` — `createAdminClient()`, server code only. Uses
  the service role key and skips all row level security. See "Database".
- `lib/supabase/env.ts` — reads the environment variables;
  `hasSupabaseEnv()` reports whether they are set without exposing them.

Session refresh on each request (Next.js `proxy.ts`) is not set up yet; it
belongs with the login step.

### Environment variables

Listed in `.env.example`. Real values go in `.env.local` (ignored by git)
and in the Vercel project settings.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — secret, server only. Must never get the
  `NEXT_PUBLIC_` prefix.

When a later step needs a new variable, add it to `.env.example` with an
empty value and list it here.

## Rules (apply to every step)

1. **One dashboard, two data sources.** Each dashboard is built as display
   components that only show the data they are given. Real pages pass
   database data; admin demo pages pass mock data to the same components.
2. **Mock data lives only in `lib/demo-data`** and is only imported by
   pages under `app/admin/demo`. Real user pages never use mock data.
3. **All colours come from named design tokens** with a light and a dark
   value. No hard-coded colour values in components. See "Design system"
   below.
4. **Build only what the current step asks for.** If something seems
   missing, ask instead of adding it.
5. **Never commit secrets.** Keys live in `.env.local` only.
6. **Before saying a step is done, run the linter and a production build
   and fix any errors.**

## Design system

**New pages must be built from the components and tokens below. Never
invent a new colour, and never write a colour value (hex, rgb, a Tailwind
palette name) in a component.** Tailwind's built-in colour palette is
switched off in `app/globals.css`, so classes like `bg-red-500` do not
exist. If a design needs a colour or component that is not here, ask first.

The style guide page at `/styleguide` shows everything in both modes. When
a component is added or changed, update that page too.

### Colour tokens

Defined once in `app/globals.css` (`:root` for light, `.dark` for dark) and
connected to Tailwind in the `@theme` block. The approved light values must
not be changed.

| Token | Tailwind name | Used for |
| --- | --- | --- |
| `background` | `bg-background` | page background |
| `surface` | `bg-surface` | cards, side menu |
| `text` | `text-foreground` | main text |
| `text-muted` | `text-muted` | secondary text |
| `border` | `border` (the default), `bg-border` | card and divider lines |
| `border-strong` | `border-border-strong` | outlined buttons |
| `input-border` | `border-input-border` | outline of Input, Textarea and Select (at least 3 to 1 against `surface`) |
| `accent` | `bg-accent` | primary buttons, progress bars, focus ring |
| `accent-contrast` | `text-accent-contrast` | text on accent |
| `accent-soft` | `bg-accent-soft` | active menu item, info badge |
| `accent-soft-text` | `text-accent-soft-text` | text on accent-soft |
| `success-soft` / `success-text` | `bg-success-soft` / `text-success-text` | success badge |
| `warning-soft` / `warning-text` | `bg-warning-soft` / `text-warning-text` | warning badge |
| `danger-soft` / `danger-text` | `bg-danger-soft` / `text-danger-text` | danger badge, form errors |
| `inverse` / `inverse-contrast` | `bg-inverse` / `text-inverse-contrast` | floating assistant button |
| `overlay` | `bg-overlay` | dimmed layer behind the phone menu |

Contrast rules (all listed pairs reach at least 4.5 to 1 in both modes):

- Use a text token only on the background it is paired with above.
  `text` and `text-muted` may go on `background`, `surface` and `border`.
- **Do not use `accent` as a text colour.** In dark mode it does not reach
  4.5 to 1 on dark backgrounds. For coloured text use `accent-soft-text`.

### Other tokens

- Corner radius: `rounded-control` (8px, buttons and inputs),
  `rounded-card` (12px), `rounded-pill` (fully round).
- Spacing: Tailwind's normal scale, one step is 4px (`p-4` is 16px).
- Shadow: `shadow-float`, the one soft shadow, for floating elements only.
- Fonts: `font-sans` is Inter (body, the default); `font-heading` is Space
  Grotesk (headings and big numbers). Base text is 14px, line height 1.45.

### Light and dark mode

next-themes, set up in `components/ui/theme-provider.tsx` and used in
`app/layout.tsx`. It follows the device on first visit, remembers the
choice, and puts a `dark` class on `<html>`. Components normally need no
`dark:` classes because the tokens change value by themselves.

### Components

In `components/ui`:

- `button.tsx` — `Button` (variants `primary`, `secondary`, `ghost`; sizes
  `md`, `sm`; `loading`, `disabled`). `buttonStyles()` gives the same look
  to a link.
- `card.tsx` — `Card` with optional `title` and `action`.
- `badge.tsx` — `Badge` (`neutral`, `info`, `success`, `warning`, `danger`).
- `input.tsx`, `textarea.tsx`, `select.tsx` — `Input`, `Textarea`,
  `Select`. Each takes a `label` and an optional `error` message.
- `field.tsx` — `Label`, `FieldError` and `Field`, the shared parts of the
  form controls.
- `table.tsx` — `Table` (scrolls sideways when too wide), `TableHead`,
  `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`.
- `progress-bar.tsx` — `ProgressBar`.
- `avatar.tsx` — `Avatar`, round, shows initials when there is no picture.
- `empty-state.tsx` — `EmptyState` (title, one line of help, one action).
- `skeleton.tsx` — `Skeleton` loading placeholder.
- `theme-toggle.tsx` — `ThemeToggle`.
- `theme-provider.tsx` — `ThemeProvider` (used once, in the root layout).
- `icons.tsx` — the small set of line icons. Add new icons here.

In `components/dashboard`:

- `app-shell.tsx` — `AppShell`, the frame for all three dashboards and the
  admin area: side menu (site name, role badge, nav links, bottom info
  card slot, theme toggle), page heading (title, subtitle, actions),
  content, and the floating assistant button (does nothing yet). Everything
  it shows comes in as props; it must never contain role-specific content.
  Pass `activeHref` to highlight the current page's link.

Also: `lib/cn.ts` — `cn()` joins class names.

### Accessibility rules

- Use real `button`, `a`, `input` and `label` elements. No click handlers
  on `div`s.
- Keep the global keyboard focus ring (in `app/globals.css`); never remove
  outlines.
- Clickable targets are at least 44px tall. (Small buttons look 32px but
  have an invisible 44px hit area.)
- Icon-only buttons need an `aria-label`.

## Database

Supabase (Postgres). The schema lives in `supabase/migrations` as numbered
SQL files. **Claude cannot reach the Supabase project and must never try
to apply SQL.** The owner runs the SQL by hand in the Supabase SQL Editor.

### Rules for database changes

- **Every new table must turn on row level security and get its policies
  and permissions (grants) in the same migration that creates it.**
- Never edit a migration that has already been delivered. Add a new file
  with the next number.
- After adding a migration: run `npm run db:combine`, update
  `lib/database.types.ts` to match, update the table list below, and tell
  the owner exactly which file(s) to run.
- Each table follows the same pattern: uuid `id`, `created_at`,
  `updated_at` (kept current by the `set_updated_at` trigger), a `user_id`
  owner column with an index, enums for fixed lists.
- Permissions are explicit. Each migration first revokes everything from
  `anon` and `authenticated`, then grants only what is needed. Signed-out
  visitors (`anon`) have no access to any table.
- No mock or sample rows in the database, ever (mock data lives in
  `lib/demo-data` only).

### Tables

People
- `profiles` — one row per user (same id as `auth.users`): display name,
  role, is_admin, time zone, plan, age_confirmed, age_confirmed_at,
  id_check_status. Only the ID check status is stored, never documents.
  `age_confirmed` is a self-declaration, not an ID check.

Creative work
- `files` — every uploaded or generated file. Stores only the storage key
  (files will live in Cloudflare R2; no Supabase storage buckets), plus
  size, dimensions and safety_status.
- `books` — an author's book, with links to manuscript and cover files.
- `characters` — saved characters, optionally linked to a book.
- `personas` — Fanvue personas, with an approval_status.
- `projects` — one piece of work (trailer, clip, image post and so on),
  optionally linked to a book and a persona.
- `scenes` — the storyboard rows of a project, in `position` order.

Generation
- `workflow_templates` — ComfyUI workflows uploaded by the admin.
- `jobs` — one generation job: status, GPU source, cost, credits.
- `gpu_connections` — a user's own GPU setup (no secrets).

Money
- `credit_wallets` — one per user: `balance` (all credits owned, including
  held) and `held` (reserved for running jobs). Available = balance - held.
- `credit_transactions` — the ledger. `amount` is always positive and
  `kind` says what happened. Rows are never edited or deleted.
- Plans and subscriptions tables come in step 7. `profiles.plan` is plain
  text until then.

Publishing
- `connected_accounts` — a user's linked social account (no secrets).
- `scheduled_posts` — a post to publish: content, platforms, time, status.

Secrets
- `gpu_connection_secrets` — RunPod API keys.
- `connected_account_secrets` — social login tokens.
- Both have row level security on and **no policies at all**, so only
  server code with the service role key can touch them. The values are
  stored unencrypted for now; **encrypting them is step 8**. Do not store
  real keys in them before then.

A trigger on `auth.users` (`handle_new_user`) creates the profile and the
credit wallet when someone signs up.

### Security rules

- Row level security is on for every table.
- Users can read only their own rows. Admins can read every table except
  the two secrets tables. Admin status is checked with
  `public.is_admin()`, a security definer function, so policies do not
  loop back on `profiles`.
- A row may only link to things its owner owns (the `owns_file`,
  `owns_book`, `owns_persona`, `owns_project` checks in the policies).
- What a signed-in user can change directly from the browser:

| Table | User can |
| --- | --- |
| `profiles` | read own; update only display_name and time_zone |
| `books`, `characters`, `projects`, `scenes` | read, add, change, delete own |
| `personas` | read, add, change, delete own; never approval_status. Editing a persona sets it back to pending |
| `scheduled_posts` | read, add, change, delete own content; status only draft or scheduled; not while posting. Never safety_status, post_url, error_message. Editing the file, caption or hashtags resets safety_status |
| `gpu_connections`, `connected_accounts` | read own, delete own (disconnect) |
| `files`, `jobs`, `credit_wallets`, `credit_transactions` | read own only |
| `workflow_templates` | nothing (admins: everything) |
| the two `_secrets` tables | nothing |

- Everything not in that table happens in **server code using
  `createAdminClient()`**: role (set once, in onboarding), age_confirmed,
  age_confirmed_at, is_admin, plan, id_check_status, all credit
  changes, creating and updating jobs (status, cost, GPU seconds,
  credits), creating and deleting files, approvals, safety results,
  connecting GPUs and social accounts, and anything touching secrets.
- `createAdminClient()` skips every rule above. Use it only in server
  code, only for those jobs, and always check who the signed-in user is
  first with the normal server client.
- Even the service role can only read and add ledger rows, not edit or
  delete them.

### TypeScript types

`lib/database.types.ts` matches the schema exactly, in the shape the
Supabase clients expect; all three client helpers are typed with it. Use
`Tables<"books">`, `TablesInsert<"books">`, `TablesUpdate<"books">` and
`Enums<"job_status">` in app code.

## Commands

- `npm run dev` — start the local dev server
- `npm run lint` — run the linter
- `npm run build` — production build
- `npm run db:combine` — rebuild `supabase/all-in-one.sql`
