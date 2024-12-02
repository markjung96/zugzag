// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser, // TypeScript parser 사용
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // JSX 파싱 활성화
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect', // React 버전 자동 감지
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules, // TypeScript 추천 규칙
      ...reactPlugin.configs.recommended.rules, // React 추천 규칙
      ...prettierConfig.rules, // Prettier 추천 규칙
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'off',
      'react/prop-types': 'off',
      'react/jsx-key': 'error', // Enforce `key` prop in iterators
    },
  },
];
