'use strict';

const { createNativeConfig } = require('@repo/eslint-config');
const globals = require('globals');

module.exports = createNativeConfig({
  tsconfigPath: './tsconfig.json',
  useTanstackQuery: true,
  layerPatterns: {
    components: ['components/**'],
    app: ['app/**'],
    api: ['api/**'],
    hooks: ['hooks/**'],
    store: ['store/**'],
    ui: ['components/ui/**'],
    theme: ['theme/**', 'styles/**'],
  },
  settings: {
    'local-rules/filename-convention': {
      component: ['components/**'],
      hook: ['hooks/**'],
      api: ['api/**'],
      store: ['store/**'],
      constant: ['constants/**'],
      util: ['utils/**'],
      type: ['types/**'],
      featureTypes: [],
    },
  },
  overrides: [
    {
      ignores: [
        'app-env.d.ts',
        'expo-env.d.ts',
        'metro.config.js',
        'jest.setup.js',
        '__tests__/mocks/**',
        'theme copy/**',
        'android/**',
        'ios/**',
        'dist/**',
      ],
    },
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      languageOptions: {
        globals: {
          process: 'readonly',
          module: 'readonly',
          require: 'readonly',
        },
      },
      rules: {
        'no-nested-ternary': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/require-await': 'off',
        'local-rules/no-stylesheet-create': 'off',
        'local-rules/no-raw-size-in-style': 'off',
        'local-rules/no-raw-color-in-style': 'off',
        'local-rules/no-inline-style-except-design': 'off',
        'local-rules/no-raw-style-value-outside-ui': 'off',
        'local-rules/no-user-facing-literal-string': 'off',
        'local-rules/no-router-import-outside-entry': 'off',
        'local-rules/strict-boolean-jsx-expression': 'off',
        'local-rules/enforce-props-naming-convention': 'off',
        'local-rules/require-accessible-label': 'off',
        'local-rules/enforce-component-member-order': 'off',
        'local-rules/no-function-call-in-usestate': 'off',
        'local-rules/no-array-index-key-in-jsx': 'off',
        'local-rules/require-functional-setstate': 'off',
        'local-rules/no-unstable-value-in-render': 'off',
        'local-rules/require-memo-for-list-item': 'off',
        'local-rules/require-async-error-handling': 'off',
        'local-rules/prefer-flatmap': 'off',
        'security/detect-object-injection': 'off',
        'react/no-unstable-nested-components': 'off',
        'promise/catch-or-return': 'off',
        'promise/prefer-await-to-then': 'off',
        'no-magic-numbers': 'off',
        'sonarjs/no-duplicate-string': 'off',
      },
    },
    {
      files: [
        '**/__tests__/**/*.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      languageOptions: {
        globals: {
          ...globals.jest,
          ...globals.node,
          global: 'readonly',
          require: 'readonly',
        },
      },
      rules: {
        'sonarjs/no-duplicate-string': 'off',
        'security/detect-object-injection': 'off',
        'local-rules/no-user-facing-literal-string': 'off',
        'local-rules/require-accessible-label': 'off',
        'local-rules/no-inline-component': 'off',
        'local-rules/no-barrel-import': 'off',
        'local-rules/no-flatlist-use-flashlist': 'off',
        'local-rules/no-flatlist-missing-perf-props': 'off',
        'local-rules/no-inline-render-item': 'off',
        'local-rules/require-props-interface': 'off',
        'react/no-unstable-nested-components': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: [
        'app.config.ts',
        'eslint.config.js',
        'babel.config.js',
        'api/**/*.ts',
        'utils/**/*.ts',
        'providers/**/*.ts',
      ],
      languageOptions: {
        globals: {
          ...globals.node,
          process: 'readonly',
          require: 'readonly',
          global: 'readonly',
        },
      },
      rules: {
        'no-param-reassign': 'off',
      },
    },
    {
      files: ['mock/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
      },
    },
    {
      files: [
        'components/modal/quest-form-modal.tsx',
        'components/quest/quest-start-date-calendar.tsx',
      ],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
    {
      files: [
        'components/navigation/dock-tab-bar.tsx',
        'hooks/useDockMagnification.ts',
      ],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
});
