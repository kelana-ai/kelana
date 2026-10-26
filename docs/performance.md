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
