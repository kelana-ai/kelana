# Load test

`load/k6.js` is a [k6](https://k6.io) script for a running Kelana app. It has three scenarios: public pages at a rising request rate, signed-in pages at a fixed rate, and the generate call. The model is replaced by `e2e/support/mock-openai.ts`, so a run costs nothing and says nothing about OpenAI. The signed-in and generate scenarios sign up five throwaway users on the dev Supabase project and delete them at the end, and the script refuses to run against production. If a run is interrupted, delete the users whose email starts with `load` from the dev project.

## Running it

```bash
pnpm build
node e2e/support/mock-openai.ts &
OPENAI_BASE_URL=http://127.0.0.1:4010/v1 OPENAI_API_KEY=load-test PORT=3111 pnpm start &
SUPABASE_URL=... SUPABASE_KEY=... BASE_URL=http://localhost:3111 k6 run load/k6.js
```

`SCENARIOS` picks the scenarios to run (`public,signedIn,generate` by default). `STEPS` sets the target requests per second of each public step, 20 seconds each. `SIGNED_IN_RATE` and `SIGNED_IN_SECONDS` set the signed-in load. The table is written to `reports/load/summary.md`. The Load workflow runs the same thing on GitHub Actions when started by hand.

## Results

Measured on a development PC with 20 logical cores under WSL2: one `next start` process, k6 on the same machine, and the hosted dev Supabase project reached over the internet. Expect the numbers to move with the machine and the network.

| Load | requests/s | avg ms | p95 ms | p99 ms | errors |
| --- | --- | --- | --- | --- | --- |
| public pages, target 20/s | 20.0 | 12 | 40 | 225 | 0.0% |
| public pages, target 40/s | 39.1 | 3 | 4 | 6 | 0.0% |
| public pages, target 80/s | 78.2 | 2 | 3 | 4 | 0.0% |
| public pages, target 160/s | 156.4 | 2 | 3 | 3 | 0.0% |
| public pages, target 320/s | 312.7 | 2 | 2 | 4 | 0.0% |
| public pages, target 640/s | 627.1 | 105 | 213 | 3280 | 0.0% |
| public pages, target 1280/s | 809.8 | 1160 | 547 | 53375 | 0.9% |
| public pages, target 2560/s | 838.4 | 445 | 566 | 720 | 0.0% |
| public pages, target 5120/s | 886.9 | 696 | 606 | 738 | 0.0% |
| public pages, target 10240/s | 914.2 | 475 | 548 | 570 | 0.0% |
| signed-in pages, 2/s for 60 s | 2.0 | 171 | 408 | 558 | 0.0% |
| generate an itinerary, 5 at a time | 15 requests | 1115 | 1522 | 1522 | 0.0% |

What the numbers say:

- Public pages answer in 2 to 4 ms up to about 300 requests per second. Queueing starts around 640 per second, and the first timeouts come at the 1280 target. From there the server stays at 840 to 910 answers per second whatever the target, so the rows above that are a saturated server, not a faster one. This is the floor for one process. On Vercel the static pages come from the CDN and the dynamic ones scale out.
- Signed-in pages cost one round trip to Supabase for the session check plus the page queries, and stay under half a second at p95.
- A generate call takes about a second with the mock model, which answers in 15 ms. The rest is the session check, the limit check and the inserts of the itinerary, its days and its activities.
- The signed-in and generate rows depend on the network between the machine and Supabase, which ranged from 100 ms to over a second per round trip while measuring. The real model adds its own time on top, and its rate limits are not part of this test.
