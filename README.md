# Kelana

Kelana is an AI-powered, eco-conscious travel planner. You describe a trip through a short multi-step wizard, and Kelana generates a day-by-day itinerary with real-world places, estimated costs, carbon estimates and eco-tags, then renders it as an interactive plan with a map, budget and carbon cards. You can refine a plan with a follow-up request, download it, and manage your profile and itineraries.

Costs and carbon figures are AI-generated estimates, not quotes or audited numbers, and the UI labels them as such.

## Tech stack

- **Next.js 16** (App Router, Server Actions, `proxy.ts`) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with **shadcn/ui** components
- **Supabase** (Postgres, Auth, Storage) with Row-Level Security
- **OpenAI** via the **AI SDK 7** (`generateText` + `Output.object`) for generation and refinement
- **Leaflet** / OpenStreetMap for maps and geocoding
- **Vitest** for unit tests
- Deployed on **Vercel**

## Prerequisites

- Node.js 24+
- [pnpm](https://pnpm.io) (pinned via `packageManager` in `package.json`)
- A Supabase project and an OpenAI API key

## Environment variables

Copy `.env.example` to `.env` and fill it in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-6-luna            # optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Authorization is enforced entirely by Supabase Row-Level Security, so no service-role/secret key is required. `NEXT_PUBLIC_SITE_URL` must be the public URL of the deployed site.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Apply the SQL in `supabase/migrations/` to your Supabase project first (`supabase db push`, or run the files in order).

Supabase Auth settings: disable "Confirm email" (sign-up signs the user in immediately, and Supabase's built-in mailer only delivers to team members), enable leaked-password protection, and use a minimum password length of 8 or more.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run the TypeScript compiler without emitting |
| `pnpm test` | Run unit tests |

## Data model

Schema and policies live in `supabase/migrations/`:

```
auth.users ──1:1── profiles
itineraries ──1:N── itinerary_days ──1:N── itinerary_activities
```

Every table is protected by Row-Level Security scoped to the owning user. Users can delete their own account through the `delete_my_account()` function.

## Deployment

The app deploys to [Vercel](https://vercel.com) from GitHub Actions with the Vercel CLI instead of Vercel's Git integration, so production only ships a commit that passed CI. The workflows live in `.github/workflows/`:

- `ci.yml` — lint, type-check, tests and a production build on every push to `main` and every pull request
- `deploy-preview.yml` — a Vercel preview for each pull request (skipped for forks), with the URL posted as a comment
- `deploy-production.yml` — production deploy of the exact commit once CI succeeds on `main`
- `supabase-keepalive.yml` — calls the `ping()` function on both Supabase projects twice a week so the free plan does not pause them

Production uses the `kelana` Supabase project and previews use `kelana-dev`. The environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` and `OPENAI_API_KEY`) are set per environment in the Vercel project; `vercel pull` hands them to the build, which matters because Next.js inlines the `NEXT_PUBLIC_*` values into the browser bundle. `vercel.json` pins the functions to Singapore (`sin1`), next to the database, and the routes that generate itineraries set `maxDuration = 300`, the longest a function may run on the free plan.

### One-time setup

1. Link the Vercel project: `vercel login`, then `vercel link`.
2. Add these secrets to the GitHub repo (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` — a Vercel access token scoped to the team (Account Settings → Tokens)
   - `VERCEL_ORG_ID` — from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json`
3. Add the repository variables read by the keep-alive workflow: `SUPABASE_PROD_URL`, `SUPABASE_PROD_KEY`, `SUPABASE_DEV_URL` and `SUPABASE_DEV_KEY` (public URLs and publishable keys).
4. Add the environment variables in the Vercel project settings.
