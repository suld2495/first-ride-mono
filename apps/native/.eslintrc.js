/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["dist/*", "metro.config.js", "jest.setup.js", "__tests__/mocks/**"],
  parserOptions: {
    project: true,
  },
  rules: {
    "no-nested-ternary": "off",
    "react/prop-types": "off",
  },
  overrides: [
    {
      files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
      env: {
        jest: true,
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
}
