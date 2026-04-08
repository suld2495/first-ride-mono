'use strict';

const { createNativeConfig } = require('@repo/eslint-config');
const globals = require('globals');

module.exports = createNativeConfig({
  tsconfigPath: './tsconfig.json',
  useTanstackQuery: true,
  overrides: [
    {
      ignores: ['.next/**', '.turbo/**'],
    },
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      languageOptions: {
        globals: {
          ...globals.node,
          process: 'readonly',
          module: 'readonly',
          require: 'readonly',
        },
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        'import/order': 'off',
        'react/self-closing-comp': 'off',
        'no-magic-numbers': 'off',
        'no-param-reassign': 'off',
        'local-rules/prefer-flatmap': 'off',
        'local-rules/no-inline-style-except-design': 'off',
        'local-rules/enforce-component-member-order': 'off',
        'local-rules/require-functional-setstate': 'off',
        'local-rules/no-user-facing-literal-string': 'off',
        'local-rules/strict-boolean-jsx-expression': 'off',
        'local-rules/enforce-props-naming-convention': 'off',
        'local-rules/js-index-maps': 'off',
      },
    },
  ],
});
