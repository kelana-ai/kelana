# Kelana

Kelana is an AI-powered, eco-conscious travel planner. You describe a trip through a short multi-step wizard, and Kelana generates a full day-by-day sustainable itinerary — real locations, costs, carbon metrics, and eco-tags — then renders it as an interactive plan with maps, budget, and carbon breakdowns.

## Tech stack

- **Next.js 16** (App Router, Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with **shadcn/ui** components
- **Supabase** (Postgres, Auth, Storage) with Row-Level Security
- **OpenAI** via the **AI SDK** (`generateObject`) for itinerary generation
- **Leaflet** / OpenStreetMap for maps and geocoding
- Deployed on **Fly.io**

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io) (pinned via `packageManager` in `package.json`)
- A Supabase project and an OpenAI API key

## Environment variables

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Authorization is enforced entirely by Supabase Row-Level Security, so no service-role/secret key is required.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |

## Data model

Schema and policies live in `supabase/migrations/`:

```
auth.users ──1:1── profiles
itineraries ──1:N── itinerary_days ──1:N── itinerary_activities
```

Every table is protected by Row-Level Security scoped to the owning user.

## Deployment

The app deploys to Fly.io on every push to `main` via `.github/workflows/fly-deploy.yml`.
