# Mutation testing

Coverage shows which lines the tests run, not whether they would notice a mistake. Stryker changes the code in `lib/` in small ways, such as flipping a comparison, emptying a string or removing a branch, and runs the unit tests against each change. A change that no test catches is a surviving mutant, and it usually points at a missing test.

## Running it

`pnpm mutate` mutates every file in `lib/` except the motion presets, the icon map, the static facts and the class name helper, which hold no logic (the list is in `stryker.config.json`). A run takes about 50 minutes. Open `reports/mutation/index.html` to see each surviving mutant in the code. The run fails when the score drops below 90%, and CI runs it every Sunday in `mutation.yml` and keeps the report for two weeks.

Stryker's Vitest runner does not work with Vitest 5: it selects tests by name with an older separator, so no test runs and every mutant looks like it survived. The config runs `vitest run` through the command runner instead and turns coverage analysis off, so each mutant runs the whole suite. The TypeScript checker drops the mutants that do not compile.

## Result

The last full run scored 98.45%: 950 mutants killed and 15 survived, plus 399 that did not compile. One survivor, in `report-client.ts`, was killed afterwards by a test that waits for the import. The other 14 are equivalent mutants, which behave exactly like the original code, so no test can tell them apart:

| File | Change | Why it makes no difference |
| --- | --- | --- |
| `data/dashboard.ts` | `{ ascending: true }` replaced by `{}` in two `order` calls | Ascending is the default order |
| `csp.ts` | `typeof report !== "object"` replaced by `false` | A value that is not an object has neither a `csp-report` nor a `type` property, so it ends in the same empty list |
| `itinerary-filters.ts` | `if (filters.query)` replaced by `if (true)` | An empty query matches every row |
| `itinerary-filters.ts` | the fallback `() => 0` replaced by `() => undefined` | `sort` reads an undefined result as 0 |
| `itinerary.ts` | the month check or the day check in `isDateKey` replaced by `true` | Each is implied by the other and the year check, because a day outside its month moves the month |
| `itinerary.ts` | the message of the error in `keyToUtc` | No caller reaches it, because they all check the date first |
| `itinerary.ts` | `m[2] ?? "0"` replaced by `m[2] ?? ""` | `Number("")` is 0 as well |
| `itinerary.ts` | the `status === "completed"` check in `effectiveStatus` | A completed trip comes out as completed through the next line |
| `itinerary.ts` | `dateTo.slice(0, 10)` replaced by `dateTo` | Two dates with the same first ten characters never compare as smaller |
| `rate-limit.ts` | the write after a rejected call | It only trims old hits from memory, and the next call trims them again |
| `sentry.ts` | `return undefined` in a catch block | A function that returns nothing gives undefined too, and TypeScript wants the explicit return |

## What it found

Two tests passed for the wrong reasons. The budget test used costs whose shares came out the same when `drink` was counted as an activity. The test for upcoming activities with an unknown day expected them first while its name said last, because the sort used `"~"` as a stand-in date and `localeCompare` places it before digits. Unknown days now sort last, and both orders of input are tested.
