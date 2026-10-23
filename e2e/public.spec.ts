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
