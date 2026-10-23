# Contributing

## Setup

Follow Getting started in the README. You need Node.js 24 and pnpm, plus a Supabase project and an OpenAI key to run the app. Run `pnpm seed` once to fill an empty dev project with a demo account and three trips.

## Workflow

1. Pick an issue or open one.
2. Branch from `main`: `feat/...`, `fix/...`, `docs/...`, `chore/...` or `test/...`.
3. Commit in small steps with a Conventional Commits prefix (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`). A message is one line, plus a sentence only when the reason is not obvious.
4. Before pushing, run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`. If you changed a page or a server action, run `pnpm e2e` too.
5. Open a pull request and link the issue with `Fixes #123` so it closes on merge. CI and a preview deployment run on every pull request.
6. Ask for a review, then merge once CI is green.

## Tests

- `pnpm test` runs the unit tests. `pnpm test:coverage` also checks the coverage thresholds in `vitest.config.mts`.
- `pnpm e2e` runs the browser tests in `e2e/` against a local build with a mocked model. Run `pnpm exec playwright install chromium` once first. The tests sign up a throwaway user and delete it at the end, so point `.env` at the dev Supabase project.
- `pnpm test:rls` signs up two throwaway users on the dev project and checks that one cannot read, change or delete the other's itineraries, days, activities, profile or avatar files, and that anonymous requests are refused. It removes both users when it ends and refuses to run against production. Run it before and after applying a migration that touches policies or functions.
- Set `E2E_BASE_URL` to run the same tests against a deployed site, with that site's `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. They then use the real model, which takes a few minutes and costs a few cents.

## Code

- Add no comments unless they explain a reason the code cannot show, such as a workaround or a hidden constraint.
- Add or update a test with every bug fix.
- Keep pages and components small, and put logic that does not need React in `lib/`.
