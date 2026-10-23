import { expect, test } from "@playwright/test"

test("the landing page has no made-up numbers or testimonials", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: /What Kelana does/ })).toBeVisible()

  const text = await page.locator("body").innerText()
  for (const phrase of ["45,000", "Watch How It Works", "What Travelers Say", "Subscribe", "$250K"]) {
    expect(text).not.toContain(phrase)
  }
})

for (const path of ["/privacy", "/terms", "/about"]) {
  test(`${path} loads`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
  })
}

for (const path of ["/dashboard", "/itinerary", "/account"]) {
  test(`${path} sends a signed-out visitor to the login page`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login/)
  })
}

test("the health endpoint reports that the database answers", async ({ request }) => {
  const response = await request.get("/api/health")
  expect(response.status()).toBe(200)
  expect(response.headers()["cache-control"]).toBe("no-store")
  expect(await response.json()).toMatchObject({ status: "ok", database: "ok" })
})

test("the public pages load without breaking the content security policy", async ({ page }) => {
  const violations: string[] = []
  page.on("console", (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text())
  })

  for (const path of ["/", "/about", "/login", "/signup", "/privacy", "/terms"]) {
    await page.goto(path)
    await page.waitForLoadState("networkidle")
  }
  expect(violations).toEqual([])
})

test("pages and routes send a content security policy", async ({ request }) => {
  for (const path of ["/", "/login", "/api/health", "/does-not-exist"]) {
    const headers = (await request.get(path)).headers()
    const policy = headers["content-security-policy"] ?? headers["content-security-policy-report-only"]
    expect(policy, path).toContain("default-src 'self'")
  }
})

