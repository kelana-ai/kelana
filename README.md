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
- Deployed on **Fly.io**

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

The app deploys to Fly.io on every push to `main` via `.github/workflows/fly-deploy.yml`, after lint, type-check, tests and a production build pass. Pull requests run the same checks without deploying.

- The three `NEXT_PUBLIC_*` values are build arguments under `[build.args]` in `fly.toml`. Next.js inlines them into the browser bundle at build time, so Fly secrets (which only exist at runtime) would be too late. They are public values; the publishable key is limited by Row-Level Security.
- The only runtime secret is the OpenAI key: `fly secrets set OPENAI_API_KEY=...` (and optionally `OPENAI_MODEL=...`).
- The workflow needs a `FLY_API_TOKEN` repository secret (`fly tokens create deploy -a kelana`).
