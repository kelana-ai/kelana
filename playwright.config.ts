import { defineConfig, devices } from "@playwright/test"

try {
  process.loadEnvFile(".env")
} catch {
  // CI passes the variables directly
}

const remote = process.env.E2E_BASE_URL
const port = Number(process.env.E2E_PORT ?? 3111)
const modelPort = Number(process.env.E2E_MODEL_PORT ?? 4010)
const baseURL = remote ?? `http://localhost:${port}`

export default defineConfig({
  testDir: "e2e",
  workers: 1,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    timezoneId: "Asia/Jakarta",
    locale: "en-US",
    viewport: { width: 1360, height: 900 },
    acceptDownloads: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: remote
    ? undefined
    : [
        {
          command: "node e2e/support/mock-openai.ts",
          url: `http://127.0.0.1:${modelPort}/health`,
          reuseExistingServer: !process.env.CI,
          env: { E2E_MODEL_PORT: String(modelPort) },
        },
        {
          command: process.env.CI ? "pnpm start" : "pnpm build && pnpm start",
          url: baseURL,
          timeout: 300_000,
          reuseExistingServer: !process.env.CI,
          env: {
            PORT: String(port),
            OPENAI_BASE_URL: `http://127.0.0.1:${modelPort}/v1`,
            OPENAI_API_KEY: "e2e-key",
          },
        },
      ],
})
