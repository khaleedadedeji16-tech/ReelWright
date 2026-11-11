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
setup) and step 2 (design system).

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

## Commands

- `npm run dev` — start the local dev server
- `npm run lint` — run the linter
- `npm run build` — production build
