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
| `/` | 89 | 100 | 100 | 100 |
| `/about` | 93 | 100 | 100 | 100 |
| `/login` | 92 | 100 | 100 | 100 |
| `/signup` | 94 | 100 | 100 | 100 |

What the reports show:

- The brand green is `#15803d`. White text on it has a ratio of 4.8 to 1 and it reads at 5.0 to 1 as text on white, where WCAG AA asks for 4.5 to 1. The earlier `#18a44b` gave 3.1 and 3.3 to 1 and was the only accessibility finding, which held the score at 96. Text on the dark photo of the home page uses a lighter green so it stays readable.
- The top of the public pages is painted with the first render. The headings on `/login` and `/signup` used to sit in a block that started invisible and faded in after hydration, about 700 ms after the HTML arrived, and the delay is now under 100 ms. The largest paint of the simulated run went from 3.8 s to 2.8 s on `/login`, from 3.8 s to 2.9 s on `/signup` and from 4.3 s to 3.1 s on `/about`, whose hero image is also loaded eagerly with high priority.
- The largest paint of the home page is still about 3.8 s. It is the hero photo (49 KB), so the simulated connection and CPU set the time and no hidden block does. Its performance score moves between 87 and 96 from run to run.
- `/about` had a layout shift of 0.11 because its loading skeleton was painted first and then replaced by the page. The static pages `/about`, `/login` and `/signup` no longer have a `loading.tsx`, and the shift on `/about` is 0.
- `/signup` still shifts by 0.04 when its form replaces the skeleton once the session is known, and it carries about 120 KiB of JavaScript that the page does not use.

