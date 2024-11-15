// eslint.config.js
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import eslintRecommended from "eslint/conf/eslint-recommended";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser, // Use TypeScript parser for TS and JS files
      ecmaFeatures: {
        jsx: true, // Enable JSX parsing
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    rules: {
      ...eslintRecommended.rules, // Apply recommended ESLint rules
      ...tsPlugin.configs.recommended.rules, // TypeScript recommended rules
      ...reactPlugin.configs.recommended.rules, // React recommended rules
      ...prettierConfig.rules, // Prettier recommended rules
      "no-unused-vars": "warn",
      "no-console": "warn",
      eqeqeq: ["error", "always"],
      "@typescript-eslint/no-explicit-any": "off",
      "react/prop-types": "off",
      "prettier/prettier": ["error", { singleQuote: true, semi: false }],
    },
  },
];
