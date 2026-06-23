import next from "eslint-config-next"

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**"] },
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]

export default eslintConfig
