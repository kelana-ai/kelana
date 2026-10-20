<div align="center">
  <img src="docs/banner.svg" width="100%" alt="Kelana: plan meaningful, low-impact trips with AI-generated itineraries">
</div>

<div align="center">

[![CI](https://img.shields.io/github/actions/workflow/status/kelana-ai/kelana/ci.yml?branch=main&style=flat&label=CI&labelColor=07100c)](https://github.com/kelana-ai/kelana/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-f0f7f3?style=flat&logo=nextdotjs&logoColor=white&labelColor=07100c)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat&logo=typescript&logoColor=white&labelColor=07100c)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white&labelColor=07100c)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ecf8e?style=flat&logo=supabase&logoColor=white&labelColor=07100c)
![License](https://img.shields.io/badge/license-MIT-8da699?style=flat&labelColor=07100c)

[Website](https://kelana-eco.vercel.app) ·
[About](https://kelana-eco.vercel.app/about) ·
[Sign up](https://kelana-eco.vercel.app/signup) ·
[Privacy](https://kelana-eco.vercel.app/privacy)

</div>

Kelana is an AI-powered, eco-conscious travel planner. You describe a trip in a
short wizard, and Kelana generates a day-by-day itinerary with real places,
estimated costs, carbon estimates and eco-tags, then shows it as an interactive
plan with a map, a budget and carbon cards.

## What it does

- Turns a trip request into an itinerary through a seven-step wizard:
  destination and dates (search or click the map), home location, travel type,
  travel styles, dietary needs, and budget.
- Generates a plan of up to 10 days with times, estimated costs and eco-tags.
  The activities it can place appear on an interactive map.
- Refines a plan from a follow-up instruction, and downloads it as a text file.
- Summarises your trips on a dashboard: upcoming activities, budget allocation
  and estimated carbon savings.
- Keeps every itinerary private to its owner: email and password sign-in,
  Row-Level Security on every table, profile preferences, avatars, and
  self-service account deletion.

## About the numbers

Costs, carbon savings and eco-tags come from the model. They are estimates, not
quotes or audited figures, and the interface labels them that way. Treat
generated places and opening hours as suggestions and check them before you
travel.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, `proxy.ts`) + React 19
- TypeScript (strict)
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Storage) with Row-Level Security
- [AI SDK](https://ai-sdk.dev) 7 + OpenAI for generation and refinement
- [Leaflet](https://leafletjs.com) with OpenStreetMap tiles and Nominatim search
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) for the wizard
- [Motion](https://motion.dev) for animations
- [Vitest](https://vitest.dev) for unit tests
- [Vercel](https://vercel.com) and GitHub Actions for hosting and CI/CD

## Getting started

Requires Node.js 24. pnpm 10 is pinned in `package.json`.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Fill in `.env` first (see below) and apply the SQL in `supabase/migrations/` to
your Supabase project. Then open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI runs the same four. `pnpm start` serves the production build.

## How it works

1. The wizard validates the trip with Zod and sends plain data to a server
   action.
2. The server action validates it again, rate-limits the user, and asks the
   model for a structured itinerary.
3. The result is cleaned before it is stored: dates come from the request, the
   budget spent is the sum of the activity costs, and times, coordinates and
   enums are validated.
4. Days and activities are saved in batches in Supabase, and the itinerary page
   reads them back with one nested query.

Refining a plan runs the same pipeline with the user's instruction and replaces
the old days only after the new ones are ready.

- Dates travel as `yyyy-MM-dd` and are stored as picked, so a trip never shifts
  by a day across time zones.
- A trip is capped at 10 days. Generation is rate-limited per user, in memory
  for each server instance plus a daily count in the database; refinement has
  the in-memory limit.
- The model comes from `OPENAI_MODEL` and defaults to `gpt-6-luna`.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key
- `OPENAI_API_KEY` — OpenAI key used by the itinerary generator
- `OPENAI_MODEL` — optional; overrides the default model
- `NEXT_PUBLIC_SITE_URL` — public URL of the site, used for the sign-out
  redirect and metadata

Authorization is enforced entirely by Row-Level Security, so no service-role
key is needed. Generating or refining an itinerary needs `OPENAI_API_KEY`.

## Database

Schema and policies live in `supabase/migrations/`; apply them with
`supabase db push`, or run the files in order.

```text
auth.users ──1:1── profiles
itineraries ──1:N── itinerary_days ──1:N── itinerary_activities
```

- Every table is protected by Row-Level Security scoped to its owner, and the
  anonymous role has no table access.
- `delete_my_account()` lets users delete their own account, and `ping()` is a
  no-op that the keep-alive workflow calls.
- In the Supabase Auth settings, turn off "Confirm email": sign-up signs the
  user in immediately, and Supabase's built-in mailer only delivers to team
  members. Use a minimum password length of 8 or more. Leaked-password
  protection needs the Pro plan.

## Deployment

Deploys to [Vercel](https://vercel.com) via GitHub Actions and the Vercel CLI,
so production only ships a commit that passed CI. Workflows run on GitHub-hosted
runners (`ubuntu-24.04`) and live in `.github/workflows/`:

- `ci.yml` — lint, type-check, tests and a production build on every push to `main` and every PR
- `deploy-preview.yml` — Vercel preview on each PR (skipped for forks), with the URL posted as a comment
- `deploy-production.yml` — production deploy of the exact commit once CI succeeds on `main`
- `supabase-keepalive.yml` — calls `ping()` on both Supabase projects twice a week so the free plan does not pause them

Production uses the `kelana` Supabase project and previews use `kelana-dev`.
Environment variables are set per environment in the Vercel project, and
`vercel pull` hands them to the build, which matters because Next.js inlines the
`NEXT_PUBLIC_*` values into the browser bundle. `vercel.json` pins the functions
to Singapore (`sin1`), next to the database, and the routes that generate or
refine itineraries set `maxDuration = 300`, the longest a function may run on
the free plan.

### Dependency notes

- `typescript` is pinned to `~6.0.3` because typescript-eslint does not support
  TypeScript 7 yet.
- `@types/node` stays on 24 to match the Node 24 runtime.
- `pnpm.onlyBuiltDependencies` lets only `sharp` (image optimization) run
  install scripts.
- The deploy workflows install the Vercel CLI with npm at an exact version, so
  a new CLI release never changes a deploy by surprise.

### One-time setup

1. Link the Vercel project: `vercel login`, then `vercel link`.
2. Add these secrets to the GitHub repo (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` — a Vercel access token scoped to the team (Account Settings → Tokens)
   - `VERCEL_ORG_ID` — from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json`
3. Add the repository variables read by the keep-alive workflow: `SUPABASE_PROD_URL`, `SUPABASE_PROD_KEY`, `SUPABASE_DEV_URL` and `SUPABASE_DEV_KEY` (public URLs and publishable keys).
4. Add the environment variables in the Vercel project settings.

## License

[MIT](LICENSE) © Kelana.
