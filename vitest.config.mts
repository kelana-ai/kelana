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
      thresholds: { lines: 6, functions: 6, branches: 7, statements: 6 },
    },
  },
})
