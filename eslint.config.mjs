import next from "eslint-config-next"

const eslintConfig = [
  { ignores: [".next/**", ".vercel/**", "node_modules/**"] },
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      complexity: ["error", 12],
      "max-lines-per-function": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
    },
  },
  { files: ["**/*.test.ts", "e2e/**/*.ts"], rules: { "max-lines-per-function": "off" } },
]

export default eslintConfig
