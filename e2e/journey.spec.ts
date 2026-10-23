import { readFile } from "node:fs/promises"

import { expect, test, type Page } from "@playwright/test"

import { deleteAccount, listAvatars } from "./support/supabase"
import { dayOfMonth, jakartaDate, longMonth, monthDay, shortDate, TRIP_DAYS, tripEnd, tripStart } from "./support/trip"

const mocked = !process.env.E2E_BASE_URL
const stamp = Date.now()
const email = `e2e${stamp}@example.com`
const password = `Kelana-e2e-${stamp}!`
const tripName = "E2E Ubud trip"
const itineraryPath = /\/itinerary\/[0-9a-f-]{36}$/
const failureTitle = "Could not generate the itinerary"
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64")

test.describe.configure({ mode: "serial" })

let page: Page
let accountDeleted = false
const pageErrors: string[] = []
const policyViolations: string[] = []

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext()
  await context.route("https://nominatim.openstreetmap.org/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify([{ display_name: "Ubud, Gianyar, Bali, Indonesia", lat: "-8.5069", lon: "115.2625" }]),
    }),
  )
  await context.route("**/*.tile.openstreetmap.org/**", (route) => route.abort())
  page = await context.newPage()
  page.on("pageerror", (error) => pageErrors.push(`${page.url()}: ${error.message}`))
  page.on("console", (message) => {
    if (/Content Security Policy/i.test(message.text())) policyViolations.push(`${page.url()}: ${message.text()}`)
  })
})

test.afterAll(async () => {
  if (!accountDeleted) await deleteAccount(email, password)
  await page.context().close()
})

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach("screenshot", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" })
  }
})

const next = () => page.getByRole("button", { name: /Continue/ }).click()
const dateButton = () => page.locator("button", { hasText: /\d{4}\s*-\s*[A-Z][a-z]{2}/ }).first()
const calendarDay = (date: Date) =>
  page
    .locator("[data-slot=popover-content]")
    .getByRole("button", { name: new RegExp(`${longMonth(date)} ${dayOfMonth(date)}(?:st|nd|rd|th)?\\b`) })
    .first()

async function openWizard(name: string) {
  await page.goto("/itinerary/new?destination=" + encodeURIComponent("Ubud, Bali"))
  await expect(page.getByText(/Selected:/)).toBeVisible({ timeout: 20_000 })
  await page.getByPlaceholder("e.g., Bali in October").fill(name)
}

async function submitWizard() {
  await next()
  await expect(page.getByText("Where are you starting from?")).toBeVisible()
  await next()
  await next()
  await page.getByText("Nature & Wildlife").click()
  await next()
  await page.getByText("Vegetarian", { exact: true }).click()
  await next()
  await expect(page.getByText("Estimated Budget Breakdown")).toBeVisible()
  await next()
  await expect(page.getByText("Trip Summary")).toBeVisible()
  await page.getByRole("button", { name: /Generate Itinerary/ }).click()
  await expect(page.getByText(/Creating your itinerary/)).toBeVisible({ timeout: 15_000 })
}

async function waitForItinerary() {
  const created = page.getByText("Daily Itinerary")
  const failed = page.getByText(failureTitle)
  await expect(created.or(failed)).toBeVisible({ timeout: 420_000 })
  await expect(failed).toHaveCount(0)
  await expect(page).toHaveURL(itineraryPath)
}

test("signing up lands on the dashboard", async () => {
  await page.goto("/signup")
  await page.getByLabel("Email").fill(email)
  await page.locator("#password").fill(password)
  await page.locator("#confirmPassword").fill(password)
  await page.getByRole("button", { name: "Create account" }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible({ timeout: 20_000 })
})

test("the header shows the signed-in menu after a full reload", async () => {
  await page.reload()
  await expect(page.locator("header button:has(span.truncate)")).toBeVisible({ timeout: 20_000 })
})

test("the wizard asks for a destination before moving on", async () => {
  await page.goto("/itinerary/new")
  await page.getByPlaceholder("e.g., Bali in October").fill("E2E Bali")
  await page.waitForLoadState("networkidle")
  await next()
  await expect(page.getByText(/Please search for a destination/i)).toBeVisible()
})

test("a destination in the URL is looked up and selected", async () => {
  await page.goto("/itinerary/new?destination=" + encodeURIComponent("Ubud, Bali"))
  await expect(page.getByText(/Selected:/)).toContainText("Ubud")
})

test("the wizard still matches its server-rendered HTML on a later day", async ({ browser }) => {
  const laterDay = new Date(Date.now() + 3 * 86_400_000)
  const context = await browser.newContext({ storageState: await page.context().storageState() })
  const later = await context.newPage()
  const errors: string[] = []
  later.on("pageerror", (error) => errors.push(error.message))
  await later.clock.setFixedTime(laterDay)
  await later.goto("/itinerary/new")
  await expect(later.locator("button", { hasText: /\d{4}\s*-\s*[A-Z][a-z]{2}/ }).first()).toContainText(jakartaDate(laterDay))
  expect(errors).toEqual([])
  await context.close()
})

test("the calendar picks the exact days that were clicked", async () => {
  await page.getByPlaceholder("e.g., Bali in October").fill(tripName)
  await dateButton().click()
  // with a range already set, clicking its end starts a new one, and the default range ends on tripStart
  await calendarDay(tripStart).click()
  await calendarDay(tripEnd).click()
  await page.keyboard.press("Escape")
  await expect(dateButton()).toContainText(`${shortDate(tripStart)} - ${shortDate(tripEnd)}`)
})

test("the wizard walks through every step and submits", async () => {
  await submitWizard()
})

test("generation finishes and opens the itinerary", async () => {
  test.setTimeout(450_000)
  await waitForItinerary()
})

test("the itinerary shows the picked dates, a tab per day, map markers and cards", async () => {
  await expect(page.getByText("Daily Itinerary")).toBeVisible({ timeout: 30_000 })
  await expect(page.locator("body")).toContainText(`${monthDay(tripStart)} - ${monthDay(tripEnd)}, ${tripEnd.getUTCFullYear()}`)
  await expect(page.getByRole("tab", { name: /^Day \d/ })).toHaveCount(TRIP_DAYS)
  await expect(page.locator(".leaflet-marker-icon").nth(1)).toBeVisible({ timeout: 30_000 })
  expect(await page.locator("[data-slot=card] p.font-medium").count()).toBeGreaterThan(0)
})

test("the budget and carbon figures are labelled as estimates", async () => {
  const text = await page.locator("body").innerText()
  expect(text).toMatch(/AI-generated estimate/)
  expect(text).toMatch(/Spent is the sum of estimated/)
})

test("day 1 is the picked start date and was not shifted", async () => {
  await expect(page.getByRole("tab", { name: /^Day 1/ })).toContainText(monthDay(tripStart))
})

test("a map marker opens a popup", async () => {
  await page.locator(".leaflet-marker-icon").last().click({ force: true })
  await expect(page.locator(".leaflet-popup-content")).toBeVisible()
})

test("popup text from the model is shown as text, not as HTML", async () => {
  test.skip(!mocked, "needs the markup that the mock model puts in a description")
  await page.locator(".leaflet-popup-close-button").click()
  await page.locator(".leaflet-marker-icon").filter({ hasText: /^2$/ }).click()
  const popup = page.locator(".leaflet-popup-content")
  await expect(popup).toContainText("Walk the ridge <b>before</b> the heat.")
  await expect(popup.locator("b")).toHaveCount(0)
})

test("the download button saves the itinerary as a text file", async () => {
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download itinerary" }).click()])
  expect(download.suggestedFilename()).toMatch(/\.txt$/)

  const text = await readFile(await download.path(), "utf8")
  expect(text).toContain("Day 1")
  expect(text).toContain(shortDate(tripStart))
  if (mocked) expect(text).toContain("Rice terrace walk, day 1")
})

test("refining returns to the itinerary with the same number of days", async () => {
  test.setTimeout(450_000)
  const instruction = "Make the second day focused on a nature hike and add a vegetarian lunch."
  await page.getByRole("link", { name: /Refine with AI/ }).click()
  await expect(page).toHaveURL(/\/refine$/)
  await page.locator("#instruction").fill(instruction)
  await page.getByRole("button", { name: "Refine itinerary" }).click()
  await expect(page).toHaveURL(itineraryPath, { timeout: 420_000 })
  await expect(page.getByText("Daily Itinerary")).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole("tab", { name: /^Day \d/ })).toHaveCount(TRIP_DAYS)

  if (mocked) {
    await page.getByRole("tab", { name: /^Day 2/ }).click()
    await expect(page.getByText(`Refined: ${instruction}`)).toBeVisible()
  }
})

test("the trip list shows the itinerary with its dates", async () => {
  await page.goto("/itinerary")
  await expect(page.getByText(tripName).first()).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText(`${shortDate(tripStart)} - ${shortDate(tripEnd)}`).first()).toBeVisible()
})

test("the dashboard shows the trip and no invented claims", async () => {
  await page.goto("/dashboard")
  await expect(page.getByText(tripName).first()).toBeVisible({ timeout: 20_000 })
  expect(await page.locator("body").innerText()).not.toMatch(/top 15%/)
  await page.getByRole("tab", { name: "Analytics" }).click()
  await expect(page.getByText("Eco Impact Score")).toBeVisible()
})

test("a profile can be saved without a username", async () => {
  await page.goto("/account")
  await page.locator("#fullName").fill("E2E Tester")
  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(page.getByText("Profile updated successfully")).toBeVisible({ timeout: 15_000 })
})

test("an invalid username is rejected and a valid one is saved", async () => {
  await page.locator("#username").fill("a!")
  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(page.getByText(/Username must be 3-30 characters/)).toBeVisible()
  await page.locator("#username").fill(`e2e_${stamp}`.slice(0, 30))
  await page.getByRole("button", { name: "Save Changes" }).click()
  await expect(page.getByText("Profile updated successfully").first()).toBeVisible({ timeout: 15_000 })
})

test("saved preferences are selected in the new trip wizard", async () => {
  await page.getByRole("tab", { name: "Preferences" }).click()
  await page.getByRole("button", { name: /Photography/ }).click()
  await page.getByRole("button", { name: "Save Preferences" }).click()
  await expect(page.getByText("Preferences saved")).toBeVisible({ timeout: 15_000 })

  await openWizard("Prefs check")
  await next()
  await next()
  await next()
  await expect(page.getByRole("checkbox", { name: /Photography/ })).toBeChecked()
})

test("an avatar upload replaces the old file and a non-image is refused", async () => {
  await page.goto("/account")
  await page.getByRole("tab", { name: "Profile" }).click()
  await page.locator("#avatar-upload").setInputFiles({ name: "a.png", mimeType: "image/png", buffer: png })
  await expect(page.getByText("Avatar updated successfully")).toBeVisible({ timeout: 20_000 })
  const first = await listAvatars(page)
  expect(first).toHaveLength(1)

  await page.locator("#avatar-upload").setInputFiles({ name: "b.png", mimeType: "image/png", buffer: png })
  await expect
    .poll(async () => {
      const files = await listAvatars(page)
      return files.length === 1 && files[0] !== first[0]
    }, { timeout: 20_000 })
    .toBe(true)

  await page.locator("#avatar-upload").setInputFiles({ name: "x.txt", mimeType: "text/plain", buffer: Buffer.from("hi") })
  await expect(page.getByText(/PNG, JPEG, WebP or GIF/)).toBeVisible()
})

test("signing out returns home and protects the pages again", async () => {
  await page.goto("/account")
  await page.getByRole("button", { name: "Sign out" }).click()
  await expect(page).toHaveURL("/", { timeout: 15_000 })
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login/)
})

test("the same credentials sign back in", async () => {
  await page.getByLabel("Email address").fill(email)
  await page.locator("#password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 })
})

test("an itinerary can be deleted from the list", async () => {
  await page.goto("/itinerary")
  await expect(page.getByText(tripName).first()).toBeVisible()
  await page.getByRole("button", { name: "More options" }).first().click()
  await page.getByRole("menuitem", { name: "Delete Itinerary" }).click()
  await page.getByRole("button", { name: "Delete", exact: true }).click()
  await expect(page.getByText("Itinerary deleted successfully")).toBeVisible({ timeout: 15_000 })
})

test("a model failure shows the recovery screen and saves nothing", async () => {
  test.skip(!mocked, "needs the mock model to fail on request")
  const failing = "Broken [model-error]"
  await openWizard(failing)
  await submitWizard()
  await expect(page.getByText(failureTitle)).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText("We couldn't generate your itinerary. Please try again.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible()
  await page.getByRole("button", { name: "Back to form" }).click()
  await expect(page.getByText("Trip Summary")).toBeVisible()
  await expect(page.getByRole("button", { name: /Generate Itinerary/ })).toBeEnabled()

  await page.goto("/itinerary")
  await expect(page.getByText(failing)).toHaveCount(0)
})

test("deleting the account signs out and removes the user", async () => {
  await page.goto("/account")
  await page.getByRole("tab", { name: "Account" }).click()
  await page.getByRole("button", { name: "Delete Account" }).click()
  const confirm = page.getByRole("button", { name: "Delete my account" })
  await expect(confirm).toBeDisabled()
  await page.getByPlaceholder("DELETE").fill("DELETE")
  await confirm.click()
  await expect(page).toHaveURL("/", { timeout: 20_000 })
  accountDeleted = true
})

test("the deleted user can no longer sign in", async () => {
  await page.goto("/login")
  await page.getByLabel("Email address").fill(email)
  await page.locator("#password").fill(password)
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.getByText(/Invalid login credentials/i)).toBeVisible({ timeout: 15_000 })
})

test("no page raised an uncaught error", () => {
  expect(pageErrors).toEqual([])
})

test("no page broke the content security policy", () => {
  expect(policyViolations).toEqual([])
})
