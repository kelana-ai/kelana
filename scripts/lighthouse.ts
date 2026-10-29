import { spawnSync } from "node:child_process"
import { appendFileSync, mkdirSync, readFileSync } from "node:fs"

export const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const
export type Scores = Record<(typeof CATEGORIES)[number], number>

interface Report {
  categories: Record<string, { score: number | null }>
}

export const MINIMUM: Scores = { performance: 70, accessibility: 90, "best-practices": 90, seo: 90 }
const WARN_ONLY = new Set(["performance"])

export function scoresOf(report: Report): Scores {
  const scores = {} as Scores
  for (const category of CATEGORIES) scores[category] = Math.round((report.categories[category]?.score ?? 0) * 100)
  return scores
}

export function problems(path: string, scores: Scores, minimum: Scores = MINIMUM) {
  const fail: string[] = []
  const warn: string[] = []
  for (const category of CATEGORIES) {
    if (scores[category] >= minimum[category]) continue
    const message = `${path}: ${category} is ${scores[category]}, the minimum is ${minimum[category]}`
    ;(WARN_ONLY.has(category) ? warn : fail).push(message)
  }
  return { fail, warn }
}

export function table(rows: { path: string; scores: Scores }[]) {
  const header = `| Page | ${CATEGORIES.join(" | ")} |\n| --- | ${CATEGORIES.map(() => "---").join(" | ")} |`
  const lines = rows.map(({ path, scores }) => `| ${path} | ${CATEGORIES.map((category) => scores[category]).join(" | ")} |`)
  return [header, ...lines].join("\n")
}

function audit(url: string, file: string) {
  const run = spawnSync(
    "pnpm",
    ["dlx", "lighthouse@13.5.0", url, "--quiet", "--output=json", `--output-path=${file}`, `--only-categories=${CATEGORIES.join(",")}`, "--chrome-flags=--headless=new --no-sandbox"],
    { stdio: ["ignore", "inherit", "inherit"], env: process.env },
  )
  if (run.status !== 0) throw new Error(`Lighthouse failed for ${url}`)
  return scoresOf(JSON.parse(readFileSync(file, "utf8")) as Report)
}

function main() {
  const base = process.env.LIGHTHOUSE_URL ?? "http://localhost:3000"
  mkdirSync("reports/lighthouse", { recursive: true })

  const rows = ["/", "/about", "/login", "/signup"].map((path) => {
    const url = `${base}${path}`
    const file = `reports/lighthouse/${path === "/" ? "home" : path.slice(1)}.json`
    // the first run warms the image optimizer and the page caches, so the scores do not depend on which page comes first
    audit(url, file)
    return { path, scores: audit(url, file) }
  })
  const summary = table(rows)
  console.log(summary)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Lighthouse\n\n${summary}\n`)

  const found = rows.map(({ path, scores }) => problems(path, scores))
  for (const message of found.flatMap((item) => item.warn)) console.warn(`warning: ${message}`)
  const failures = found.flatMap((item) => item.fail)
  for (const message of failures) console.error(`error: ${message}`)
  if (failures.length) process.exit(1)
}

if (import.meta.main) main()
