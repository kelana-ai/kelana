# Runbook

What to do when something goes wrong in production. Production is the Vercel project `kelana-eco` (team `kelana`) with the Supabase project `kelana`. Previews and local runs use the `kelana-dev` project.

## Check the site

- `https://kelana-eco.vercel.app/api/health` answers 200 when the database answers and 503 when it does not.
- The Uptime workflow requests it every five minutes (GitHub can start a run a few minutes late). When it fails it opens an issue labelled `incident`, and it closes the issue when the endpoint answers again.
- Every generate and refine call writes one JSON log line with `event: "itinerary.generation"`, the outcome, the durations and the token counts. Vercel keeps function logs for one hour, so look soon after an alert.

## Go back after a bad deploy

Production deploys come from the Deploy Production workflow, which publishes the commit that passed CI.

1. Open the project in Vercel, go to Deployments and pick the last production deployment that was good.
2. Use Instant Rollback on it. The command line does the same: `vercel rollback <deployment-url> --scope kelana`.
3. Open an issue, then fix forward or revert the commit through a pull request (`git revert <sha>`).

After a rollback Vercel can stop pointing the production domain at new deployments. Once the fix is merged, check the Deployments page and promote the new deployment by hand if the domain still shows the old one.

A rollback does not touch the database. If the bad deploy came with a migration, roll the migration back too (below) and check that the older code still works with the schema.

## Go back after a bad migration

New migrations go to the dev project first, then `pnpm test:rls` runs against it, and only then production.

Every migration from 20261023 on has a script with the same name in `supabase/rollbacks/`. A test fails when one is missing. To go back:

1. Roll the deployment back first when the current code calls what the migration added.
2. Run the rollback script in the SQL editor of the affected project (dev first when you are testing the way back).
3. Run `pnpm test:rls` against dev.

Older migrations have no rollback script. For those, write the inverse by hand and test it on dev, or restore a Supabase backup (daily backups need a paid plan).

## Switch off generation

Set `FEATURE_GENERATION=off` for the Production environment in the Vercel project settings, then redeploy the current deployment, because new values only apply to new deployments. Creating and refining then answer "Itinerary generation is switched off for now" without calling the model or the database. Remove the variable, or set it to `on`, and redeploy to switch generation back on.

Use it when the model bill spikes, when the provider has an outage, or when a bad prompt change has been deployed.

## Drills

Each procedure should be tried once on a preview before it is needed. Add a line when you do.

| Procedure | Tried on | By |
| --- | --- | --- |
| Roll back a deployment | not yet | |
| Run a rollback script | not yet | |
| Switch generation off | local production build, 2026-10-23 | |
