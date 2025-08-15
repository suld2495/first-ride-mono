/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["dist/*", "metro.config.js"],
  parserOptions: {
    project: true,
  }
}
