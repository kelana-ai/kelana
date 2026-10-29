import http from "k6/http"
import encoding from "k6/encoding"
import exec from "k6/execution"
import { check, fail } from "k6"

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000"
const SUPABASE_URL = __ENV.SUPABASE_URL
const SUPABASE_KEY = __ENV.SUPABASE_KEY
const WANTED = (__ENV.SCENARIOS || "public,signedIn,generate").split(",")
const USERS = Number(__ENV.LOAD_USERS || 5)
const STEPS = (__ENV.STEPS || "20,40,80,160,320").split(",").map(Number)
const STEP_SECONDS = Number(__ENV.STEP_SECONDS || 20)
const SIGNED_IN_RATE = Number(__ENV.SIGNED_IN_RATE || 2)
const SIGNED_IN_SECONDS = Number(__ENV.SIGNED_IN_SECONDS || 60)
const GENERATIONS_PER_USER = Number(__ENV.GENERATIONS_PER_USER || 3)
const PASSWORD = `Kelana-load-${Date.now()}!`

const PUBLIC_PAGES = ["/", "/", "/", "/about", "/about", "/login", "/signup", "/privacy", "/terms"]
const SIGNED_IN_PAGES = ["/dashboard", "/itinerary", "/account"]
const RAMP_SECONDS = STEPS.length * (STEP_SECONDS + 2)
const NEEDS_USERS = WANTED.includes("signedIn") || WANTED.includes("generate")

const stepTags = STEPS.reduce((all, rate) => ({ ...all, [`http_req_failed{step:${rate}}`]: [], [`http_req_duration{step:${rate}}`]: [] }), {})

function scenarios() {
  const all = {}
  let offset = 0
  if (WANTED.includes("public")) {
    all.public = {
      executor: "ramping-arrival-rate",
      exec: "publicPages",
      startRate: STEPS[0],
      timeUnit: "1s",
      preAllocatedVUs: 50,
      maxVUs: 600,
      stages: STEPS.flatMap((rate) => [
        { target: rate, duration: "2s" },
        { target: rate, duration: `${STEP_SECONDS}s` },
      ]),
    }
    offset += RAMP_SECONDS + 5
  }
  if (WANTED.includes("signedIn")) {
    all.signedIn = {
      executor: "constant-arrival-rate",
      exec: "signedInPages",
      rate: SIGNED_IN_RATE,
      timeUnit: "1s",
      duration: `${SIGNED_IN_SECONDS}s`,
      startTime: `${offset}s`,
      preAllocatedVUs: 10,
      maxVUs: 50,
    }
    offset += SIGNED_IN_SECONDS + 5
  }
  if (WANTED.includes("generate")) {
    all.generate = {
      executor: "shared-iterations",
      exec: "generateItinerary",
      vus: USERS,
      iterations: USERS * GENERATIONS_PER_USER,
      startTime: `${offset}s`,
      maxDuration: "5m",
    }
  }
  return all
}

export const options = {
  scenarios: scenarios(),
  thresholds: {
    "http_req_failed{scenario:public}": ["rate<0.01"],
    "http_req_duration{scenario:public}": ["p(95)<1500"],
    "http_req_failed{scenario:signedIn}": ["rate<0.01"],
    "http_req_duration{scenario:signedIn}": ["p(95)<3000"],
    "http_req_failed{scenario:generate}": ["rate<0.01"],
    "http_req_duration{scenario:generate}": ["p(95)<10000"],
    checks: ["rate>0.99"],
    ...stepTags,
  },
  summaryTrendStats: ["avg", "med", "p(95)", "p(99)", "max"],
}

function cookieFor(session) {
  const ref = SUPABASE_URL.replace(/^https?:\/\//, "").split(".")[0]
  const value = `base64-${encoding.b64encode(JSON.stringify(session), "rawurl")}`
  const chunks = value.match(/.{1,3180}/g)
  return chunks.length === 1 ? [[`sb-${ref}-auth-token`, value]] : chunks.map((chunk, index) => [`sb-${ref}-auth-token.${index}`, chunk])
}

function signUp(index) {
  const response = http.post(
    `${SUPABASE_URL}/auth/v1/signup`,
    JSON.stringify({ email: `load${Date.now()}u${index}@example.com`, password: PASSWORD }),
    { headers: { apikey: SUPABASE_KEY, "content-type": "application/json" }, tags: { name: "supabase-signup" } },
  )
  const session = response.json()
  if (response.status !== 200 || !session.access_token) fail(`could not create load user ${index}: ${response.status} ${response.body}`)
  return session
}

export function setup() {
  const start = Date.now()
  if (!NEEDS_USERS) return { start, sessions: [] }
  if (!SUPABASE_URL || !SUPABASE_KEY) fail("SUPABASE_URL and SUPABASE_KEY must point at the dev project")
  if (SUPABASE_URL.includes("caeawmpnhnipzknsllce")) fail("refusing to create users on the production project")

  return { start, sessions: Array.from({ length: USERS }, (_, index) => signUp(index)) }
}

function stepOf(start) {
  const index = Math.min(STEPS.length - 1, Math.floor((Date.now() - start) / 1000 / (STEP_SECONDS + 2)))
  return String(STEPS[index])
}

function authenticate(data) {
  const jar = http.cookieJar()
  for (const [name, value] of cookieFor(data.sessions[exec.scenario.iterationInTest % data.sessions.length])) jar.set(BASE_URL, name, value)
}

export function publicPages(data) {
  const path = PUBLIC_PAGES[Math.floor(Math.random() * PUBLIC_PAGES.length)]
  const response = http.get(`${BASE_URL}${path}`, { tags: { step: stepOf(data.start), name: path } })
  check(response, { "public page answers 200": (r) => r.status === 200 })
}

export function signedInPages(data) {
  authenticate(data)
  const path = SIGNED_IN_PAGES[Math.floor(Math.random() * SIGNED_IN_PAGES.length)]
  const response = http.get(`${BASE_URL}${path}`, { tags: { name: path }, redirects: 0 })
  check(response, { "signed-in page answers 200": (r) => r.status === 200 })
}

function lastEvent(response) {
  const lines = String(response.body || "").trim().split("\n")
  try {
    return JSON.parse(lines[lines.length - 1])
  } catch (_) {
    return {}
  }
}

export function generateItinerary(data) {
  authenticate(data)
  const day = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)
  const trip = {
    tripName: `Load test ${exec.scenario.iterationInTest}`,
    destination: { name: "Ubud, Bali", lat: -8.5069, lng: 115.2625 },
    dateFrom: day,
    dateTo: day,
    travelType: "solo",
    travelStyles: ["nature"],
    dietaryNeeds: [],
    budget: 500,
  }
  const response = http.post(`${BASE_URL}/api/itinerary`, JSON.stringify(trip), {
    headers: { "content-type": "application/json" },
    tags: { name: "generate" },
  })
  const done = check(response, { "generation ends with an itinerary": (r) => r.status === 200 && lastEvent(r).type === "done" })
  if (!done) console.warn(`generation failed with ${response.status}: ${String(response.body).slice(-300)}`)
}

function deleteUser(session) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = http.post(`${SUPABASE_URL}/rest/v1/rpc/delete_my_account`, "{}", {
      headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${session.access_token}`, "content-type": "application/json" },
      tags: { name: "supabase-cleanup" },
    })
    if (response.status < 300) return
  }
  console.warn("could not delete a load user, remove the users whose email starts with load from the dev project")
}

export function teardown(data) {
  for (const session of data.sessions) deleteUser(session)
}

function row(label, duration, failed, seconds) {
  const requests = failed.passes + failed.fails
  const rate = seconds ? (requests / seconds).toFixed(1) : "-"
  return `| ${label} | ${requests} | ${rate} | ${duration.avg.toFixed(0)} | ${duration["p(95)"].toFixed(0)} | ${duration["p(99)"].toFixed(0)} | ${(failed.rate * 100).toFixed(1)}% |`
}

function rowsOf(data) {
  const wanted = [
    ...STEPS.map((rate) => [`public pages, target ${rate}/s`, `step:${rate}`, STEP_SECONDS + 2]),
    [`signed-in pages, target ${SIGNED_IN_RATE}/s`, "scenario:signedIn", SIGNED_IN_SECONDS],
    ["generate an itinerary", "scenario:generate", 0],
  ]
  return wanted.flatMap(([label, tag, seconds]) => {
    const duration = data.metrics[`http_req_duration{${tag}}`]?.values
    const failed = data.metrics[`http_req_failed{${tag}}`]?.values
    return duration && failed && failed.passes + failed.fails > 0 ? [row(label, duration, failed, seconds)] : []
  })
}

export function handleSummary(data) {
  const header = ["| Load | requests | requests/s | avg ms | p95 ms | p99 ms | errors |", "| --- | --- | --- | --- | --- | --- | --- |"]
  const table = [...header, ...rowsOf(data)].join("\n")
  return { stdout: `${table}\n`, "reports/load/summary.md": `${table}\n`, "reports/load/summary.json": JSON.stringify(data, null, 2) }
}
