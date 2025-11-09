import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      // require semicolons where appropriate
      semi: ["error", "always"],
      // enforce a single newline at end of file
      "eol-last": ["error", "always"],
      // disallow trailing whitespace
      "no-trailing-spaces": "error",
      // prevent multiple consecutive empty lines; maxEOF: 0 disallows empty lines at EOF
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
    },
  },
]);
