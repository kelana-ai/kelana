# Performance

Numbers to compare later changes with. They come from single runs on a laptop and the free Supabase plan, so expect them to move a little between runs.

## Database queries

Measured with `EXPLAIN (ANALYZE, BUFFERS)` on the dev project as an authenticated user, with row-level security active. The data was generated inside a transaction that was rolled back: 22,000 activities in 4,400 days and 440 itineraries, of which the test user owns 150 itineraries, 1,200 days and 6,000 activities.

| Query | Used by | Rows | Execution | Plan |
| --- | --- | --- | --- | --- |
| Itineraries of the user, newest first | dashboard, trip list | 150 | 0.18 ms | Bitmap index scan on `idx_itineraries_user_id`, then a sort |
| Days in a two day window | dashboard, upcoming activities | 19 | 0.61 ms | Sequential scan on `itinerary_days` with the row-level security filter; there is no index on `date` |
| Planned activities of those days | dashboard, upcoming activities | 95 | 1.76 ms | Index scan on `unique_activity_per_day` with `day_id = ANY(...)` |
| One itinerary with its days and activities | itinerary page | 40 | 0.54 ms | Index scans on `itineraries_pkey`, `unique_day_per_itinerary` and `unique_activity_per_day` |
| Budget totals by activity type (`budget_by_type()`) | dashboard budget chart | 9 | 13.0 ms | Sequential scan on `itinerary_activities` with the row-level security filter, then a sort and a group |

What the plans show:

- Every query on days and activities pays for the row-level security filter, which first collects the ids of the days of the user (1,200 here). That costs about a millisecond per query.
- Only the budget totals grow with all the activities of a user. The other queries use indexes.
- If a large account makes the dashboard slow, an index on `itinerary_days(date)` helps the window query, and storing the owner on days and activities would remove the join from the policies. Neither is worth it at this size.

The before and after plans of the budget query, which used to read up to 5000 rows and add them up in JavaScript, are in pull request 61.

## Lighthouse

Lighthouse 13.5.0 with its default mobile settings (a simulated slow 4G connection and a 4x slower CPU), run against a production build served on the same laptop. The scores are the median of three runs of `scripts/lighthouse.ts`, the script that audits every pull request. A pull request fails when accessibility, best practices or SEO drop below 90. The performance score only warns, because it moves by ten points or more between runs.

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 89 | 96 | 100 | 100 |
| `/about` | 79 | 96 | 100 | 100 |
| `/login` | 86 | 96 | 100 | 100 |
| `/signup` | 84 | 96 | 100 | 100 |

What the reports show:

- The first paint is fast (0.9 s) but the largest paint takes 3.2 to 4.6 s. The heading on `/login` and `/signup` sits in a block that starts invisible and fades in once the page has loaded its JavaScript, so it is painted about 700 ms after the HTML arrives. The home page and `/about` wait for their hero image in the same way.
- Colour contrast is the only accessibility finding. White text on the brand green (`#18a44b`) has a ratio of 3.1 to 1, and green text on white 3.3 to 1, where WCAG AA asks for 4.5 to 1. It affects the main buttons and links on every page, so fixing it means a darker shade of the brand colour.
- `/about` has a layout shift of 0.11 in the values section, just over the limit of 0.1.
- `/signup` carries about 107 KiB of JavaScript that the page does not use.

