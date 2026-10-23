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
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "contexts/**/*.{ts,tsx}", "utils/**/*.ts", "lib/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='supabase'][callee.property.name=/^(from|rpc)$/]",
          message: "Query Supabase through the functions in lib/data.",
        },
        {
          selector: "CallExpression[callee.object.property.name='storage'][callee.property.name='from']",
          message: "Use the storage functions in lib/data.",
        },
      ],
    },
  },
]

export default eslintConfig
