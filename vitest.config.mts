import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "utils/**/*.ts", "contexts/**/*.tsx", "app/**/*.{ts,tsx}", "components/**/*.tsx"],
      exclude: ["**/*.test.*", "components/ui/**"],
      reporter: ["text-summary", "text"],
      thresholds: {
        lines: 22,
        functions: 21,
        branches: 27,
        statements: 24,
        "lib/**": { lines: 90, functions: 90, branches: 85, statements: 90 },
        "app/itinerary/generation.ts": { lines: 85, functions: 80, branches: 90, statements: 85 },
        "app/itinerary/**/submit.ts": { lines: 95, functions: 95, branches: 90, statements: 95 },
        "app/itinerary/**/refine.ts": { lines: 95, functions: 95, branches: 90, statements: 95 },
        "app/dashboard/dashboard.ts": { lines: 95, functions: 95, branches: 75, statements: 95 },
        "app/account/profile-data.ts": { lines: 95, functions: 95, branches: 90, statements: 95 },
        "app/itinerary/new/wizard.ts": { lines: 95, functions: 95, branches: 90, statements: 95 },
      },
    },
  },
})
