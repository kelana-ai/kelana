# Contributing

## Setup

Follow Getting started in the README. You need Node.js 24 and pnpm, plus a Supabase project and an OpenAI key to run the app.

## Workflow

1. Pick an issue or open one.
2. Branch from `main`: `feat/...`, `fix/...`, `docs/...`, `chore/...` or `test/...`.
3. Commit in small steps with a Conventional Commits prefix (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`). A message is one line, plus a sentence only when the reason is not obvious.
4. Before pushing, run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.
5. Open a pull request and link the issue with `Fixes #123` so it closes on merge. CI and a preview deployment run on every pull request.
6. Ask for a review, then merge once CI is green.

## Code

- Add no comments unless they explain a reason the code cannot show, such as a workaround or a hidden constraint.
- Add or update a test with every bug fix.
- Keep pages and components small, and put logic that does not need React in `lib/`.
