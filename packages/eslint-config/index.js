'use strict';

const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');
const boundariesPlugin = require('eslint-plugin-boundaries');
const sonarjsPlugin = require('eslint-plugin-sonarjs');
const unicornPlugin = require('eslint-plugin-unicorn').default ?? require('eslint-plugin-unicorn');
const securityPlugin = require('eslint-plugin-security');
const promisePlugin = require('eslint-plugin-promise');
const tanstackQueryPlugin = require('@tanstack/eslint-plugin-query');
const globals = require('globals');
const {
  DEFAULT_LAYER_PATTERNS,
  SETTINGS_KEY,
} = require('./eslint-local-rules/path-groups');

// 로컬 커스텀 룰 플러그인 빌드 (eslint-local-rules/ 하위 모든 룰 통합)
const localRulesPlugin = {
  rules: {
    ...require('./eslint-local-rules/javascript'),
    ...require('./eslint-local-rules/typescript'),
    ...require('./eslint-local-rules/react'),
    ...require('./eslint-local-rules/react-native'),
    ...require('./eslint-local-rules/tamagui'),
    ...require('./eslint-local-rules/i18n'),
    ...require('./eslint-local-rules/tanstack-query'),
    ...require('./eslint-local-rules/web'),
  },
};

/**
 * React Native (Expo) 앱용 ESLint flat config 생성
 *
 * @param {object} options
 * @param {string}  [options.tsconfigPath='./tsconfig.json'] - 프로젝트 tsconfig 경로
 * @param {boolean} [options.useTanstackQuery=false]         - TanStack Query 룰 활성화
 * @param {string}  [options.filesPattern='**\/*.{ts,tsx}'] - 룰을 적용할 파일 패턴
 * @param {object[]} [options.overrides=[]]                  - 추가 flat config 객체 배열
 */
function createNativeConfig({
  tsconfigPath = './tsconfig.json',
  useTanstackQuery = false,
  filesPattern = '**/*.{ts,tsx}',
  layerPatterns = {},
  settings = {},
  overrides = [],
} = {}) {
  return [
    js.configs.recommended,

    // ─── 무시할 파일 ────────────────────────────────────────────────
    {
      ignores: [
        'coverage/**',
        'dist/**',
        '.expo/**',
        'expo-env.d.ts',
        'node_modules/**',
      ],
    },

    // ─── TanStack Query 공식 플러그인 ────────────────────────────────
    ...(useTanstackQuery
      ? [
          {
            plugins: { '@tanstack/query': tanstackQueryPlugin },
            rules: {
              '@tanstack/query/exhaustive-deps': 'error',
              '@tanstack/query/no-rest-destructuring': 'error',
              '@tanstack/query/stable-query-client': 'error',
              '@tanstack/query/no-unstable-deps': 'error',
            },
          },
        ]
      : []),

    // ─── 메인 규칙 ───────────────────────────────────────────────────
    {
      files: [filesPattern],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: tsconfigPath,
          ecmaFeatures: { jsx: true },
        },
        globals: {
          ...globals.browser,
          ...globals.es2021,
          React: 'writable',
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
        import: importPlugin,
        boundaries: boundariesPlugin,
        sonarjs: sonarjsPlugin,
        unicorn: unicornPlugin,
        security: securityPlugin,
        promise: promisePlugin,
        'local-rules': localRulesPlugin,
      },
      settings: {
        react: { version: 'detect' },
        'import/resolver': {
          typescript: { project: tsconfigPath },
        },
        [SETTINGS_KEY]: {
          ...DEFAULT_LAYER_PATTERNS,
          ...layerPatterns,
        },
        ...settings,
      },
      rules: {
        // ── TypeScript ────────────────────────────────────────────────
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/consistent-type-exports': 'error',
        '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/strict-boolean-expressions': [
          'error',
          {
            allowString: false,
            allowNumber: false,
            allowNullableObject: false,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',

        // ── React ─────────────────────────────────────────────────────
        'react/display-name': 'error',
        'react/no-unstable-nested-components': 'error',
        'react/self-closing-comp': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',

        // ── Import 순서 ───────────────────────────────────────────────
        'import/no-duplicates': 'error',
        'simple-import-sort/imports': 'off',
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
            'newlines-between': 'always',
            alphabetize: { order: 'asc' },
          },
        ],

        // ── SonarJS ───────────────────────────────────────────────────
        'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
        'sonarjs/cognitive-complexity': ['error', 15],
        'sonarjs/no-identical-functions': 'error',

        // ── Unicorn ───────────────────────────────────────────────────
        'unicorn/no-array-for-each': 'error',
        'unicorn/prefer-ternary': 'error',
        'unicorn/no-nested-ternary': 'error',

        // ── Security ──────────────────────────────────────────────────
        'security/detect-object-injection': 'error',

        // ── Promise ───────────────────────────────────────────────────
        'promise/catch-or-return': 'error',
        'promise/always-return': 'error',
        'promise/no-return-wrap': 'error',
        'promise/prefer-await-to-then': 'error',
        'promise/prefer-await-to-callbacks': 'error',
        'promise/no-nesting': 'error',

        // ── ESLint 기본 ───────────────────────────────────────────────
        'no-unused-vars': 'off',
        'no-nested-ternary': 'off',
        'no-alert': 'off',
        'default-case': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'prefer-destructuring': ['error', { array: false, object: true }],
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-object-spread': 'error',
        eqeqeq: ['error', 'always'],
        'no-empty': ['error', { allowEmptyCatch: false }],
        'no-console': ['error', { allow: ['error'] }],
        'no-unsafe-optional-chaining': 'error',
        'prefer-object-has-own': 'error',
        'no-param-reassign': [
          'error',
          {
            props: true,
            ignorePropertyModificationsFor: [
              'acc',
              'accumulator',
              'e',
              'event',
              'req',
              'request',
              'res',
              'response',
              'staticContext',
            ],
          },
        ],
        'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
        'no-warning-comments': [
          'error',
          { terms: ['TODO', 'FIXME', 'HACK', 'XXX'], location: 'start' },
        ],
        'no-magic-numbers': [
          'error',
          {
            ignore: [0, 1, -1, 100],
            ignoreArrayIndexes: true,
            ignoreDefaultValues: true,
            enforceConst: true,
          },
        ],
        'no-restricted-syntax': [
          'error',
          {
            selector: 'CallExpression[callee.property.name="sort"]',
            message: '.sort()는 원본 배열을 변이시킵니다. .toSorted()를 사용하세요.',
          },
          {
            selector: 'CallExpression[callee.property.name="reverse"]',
            message: '.reverse()는 원본 배열을 변이시킵니다. .toReversed()를 사용하세요.',
          },
          {
            selector: 'CallExpression[callee.property.name="splice"]',
            message: '.splice()는 원본 배열을 변이시킵니다. 불변 패턴을 사용하세요.',
          },
        ],

        // ── Prettier ──────────────────────────────────────────────────
        'prettier/prettier': ['error', { endOfLine: 'auto' }],

        // ── 커스텀 룰 (local-rules) ───────────────────────────────────
        // React / 스타일
        'local-rules/no-raw-color-in-style': 'error',
        'local-rules/no-raw-size-in-style': 'error',
        'local-rules/no-inline-style-except-design': 'error',
        'local-rules/no-raw-style-value-outside-ui': 'error',
        'local-rules/no-tamagui-token-string-outside-ui': 'error',
        'local-rules/no-direct-external-ui-import': 'error',
        'local-rules/no-multiple-components-in-file': 'error',
        // 아키텍처 / 레이어
        'local-rules/no-cross-feature-import': 'error',
        'local-rules/no-store-import-in-components': 'error',
        'local-rules/no-api-call-outside-allowed-layers': 'error',
        'local-rules/no-relative-import-outside-feature': 'error',
        'local-rules/no-feature-import-in-ui': 'error',
        'local-rules/no-async-in-ui': 'error',
        'local-rules/no-business-logic-in-ui': 'error',
        'local-rules/no-store-features-in-hooks': 'error',
        'local-rules/no-api-in-hooks': 'error',
        'local-rules/no-api-in-store-common': 'error',
        'local-rules/no-api-in-store': 'error',
        'local-rules/no-cross-feature-api-import': 'error',
        'local-rules/no-services-direct-import-in-feature-hooks': 'error',
        // 상태 / 렌더링
        'local-rules/no-render-mutation': 'error',
        'local-rules/no-inline-component': 'error',
        'local-rules/no-inline-default-in-memo': 'error',
        'local-rules/strict-boolean-jsx-expression': 'error',
        'local-rules/rendering-hoist-jsx': 'error',
        'local-rules/no-router-import-outside-entry': 'error',
        'local-rules/no-array-index-key-in-jsx': 'error',
        'local-rules/no-unstable-value-in-render': 'error',
        'local-rules/no-global-init-in-effect': 'error',
        // Zustand
        'local-rules/no-zustand-without-selector': 'error',
        'local-rules/no-zustand-full-selector': 'error',
        // Tamagui
        'local-rules/no-stylesheet-create': 'error',
        'local-rules/no-raw-tamagui-prop': 'error',
        // JavaScript 최적화
        'local-rules/no-trivial-usememo': 'error',
        'local-rules/require-functional-setstate': 'error',
        'local-rules/no-function-call-in-usestate': 'error',
        'local-rules/no-setstate-in-effect-for-derived': 'error',
        'local-rules/prefer-flatmap': 'error',
        'local-rules/no-find-in-loop': 'error',
        'local-rules/no-sort-for-minmax': 'error',
        'local-rules/no-includes-in-loop': 'error',
        'local-rules/js-hoist-regexp': 'error',
        'local-rules/js-index-maps': 'error',
        // React Native 성능
        'local-rules/require-flatlist-keyextractor': 'error',
        'local-rules/require-memo-for-list-item': 'error',
        'local-rules/require-accessible-label': 'error',
        'local-rules/no-flatlist-use-flashlist': 'error',
        'local-rules/require-flashlist-estimated-size': 'error',
        'local-rules/no-textinput-value-defaultvalue': 'error',
        'local-rules/no-controlled-textinput': 'error',
        'local-rules/no-reanimated-state-in-worklet': 'error',
        'local-rules/require-worklet-directive': 'error',
        'local-rules/no-heavy-func-in-animated-style': 'error',
        'local-rules/no-reanimated-style-on-view': 'error',
        'local-rules/no-scrollview-map-render': 'error',
        'local-rules/no-inline-render-item': 'error',
        'local-rules/no-index-key-extractor': 'error',
        'local-rules/no-flatlist-missing-get-item-layout': 'error',
        'local-rules/no-flatlist-missing-perf-props': 'error',
        'local-rules/no-barrel-import': 'error',
        // 컴포넌트 구조
        'local-rules/enforce-component-member-order': 'error',
        'local-rules/require-props-interface': 'error',
        'local-rules/enforce-props-naming-convention': 'error',
        'local-rules/require-barrel-export': 'error',
        'local-rules/enforce-filename-convention': 'error',
        'local-rules/max-file-lines': 'error',
        // async
        'local-rules/async-parallel': 'error',
        'local-rules/async-defer-await': 'error',
        'local-rules/no-async-in-component': 'error',
        'local-rules/no-data-transform-in-component': 'error',
        'local-rules/no-deep-logic-in-component': 'error',
        // API
        'local-rules/require-tanstack-query-for-api': 'error',
        'local-rules/require-mutation-error-handler': 'error',
        'local-rules/require-try-catch-in-api-layer': 'error',
        'local-rules/require-api-error-throw': 'error',
        'local-rules/no-http-status-in-api-layer': 'error',
        // i18n
        'local-rules/no-user-facing-literal-string': 'error',
        // 이벤트
        'local-rules/require-passive-event-listener': 'error',
      },
    },

    // ─── API 레이어 전용 규칙 ────────────────────────────────────────
    {
      files: [
        '**/api/**/*.ts',
        '**/services/**/*.ts',
        '**/hooks/**/*.ts',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        'local-rules/require-async-error-handling': 'error',
      },
    },

    // ─── TanStack Query 커스텀 룰 ────────────────────────────────────
    ...(useTanstackQuery
      ? [
          {
            files: [filesPattern],
            rules: {
              'local-rules/query-key-no-nonserializable-values': 'error',
              'local-rules/suspense-query-requires-error-boundary': 'error',
              'local-rules/infinite-query-requires-page-param': 'error',
              'local-rules/query-fn-must-use-abort-signal': 'error',
              'local-rules/mutation-must-handle-cache-sync': 'error',
              'local-rules/no-global-invalidate-queries': 'error',
              'local-rules/query-key-must-be-array': 'error',
              'local-rules/query-key-must-use-factory': 'error',
              'local-rules/no-dynamic-usequery-in-loops': 'error',
              'local-rules/query-key-first-segment-static': 'error',
              'local-rules/require-enabled-on-conditional-query': 'error',
            },
          },
        ]
      : []),

    // ─── 테스트 파일: typed linting 비활성화 ───────────────────────
    {
      files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      languageOptions: {
        parserOptions: { project: false },
        globals: { ...globals.jest },
      },
      rules: {
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/prefer-readonly': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-magic-numbers': 'off',
        'promise/prefer-await-to-callbacks': 'off',
      },
    },

    // ─── Prettier (항상 마지막) ──────────────────────────────────────
    prettierRecommended,

    // ─── 앱별 오버라이드 ─────────────────────────────────────────────
    ...overrides,
  ];
}

/**
 * 공유 패키지 / 서버용 TypeScript 전용 flat config 생성 (React/RN 룰 제외)
 *
 * @param {object} options
 * @param {string}  [options.tsconfigPath='./tsconfig.json']
 * @param {boolean} [options.useTanstackQuery=false]
 * @param {string}  [options.filesPattern='**\/*.ts']
 * @param {object[]} [options.overrides=[]]
 */
function createBaseConfig({
  tsconfigPath = './tsconfig.json',
  useTanstackQuery = false,
  filesPattern = '**/*.ts',
  layerPatterns = {},
  settings = {},
  overrides = [],
} = {}) {
  return [
    js.configs.recommended,
    {
      ignores: ['coverage/**', 'dist/**', 'node_modules/**'],
    },

    ...(useTanstackQuery
      ? [
          {
            plugins: { '@tanstack/query': tanstackQueryPlugin },
            rules: {
              '@tanstack/query/exhaustive-deps': 'error',
              '@tanstack/query/no-rest-destructuring': 'error',
              '@tanstack/query/stable-query-client': 'error',
              '@tanstack/query/no-unstable-deps': 'error',
            },
          },
        ]
      : []),

    {
      files: [filesPattern],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: tsconfigPath,
        },
        globals: {
          ...globals.browser,
          ...globals.es2021,
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        import: importPlugin,
        sonarjs: sonarjsPlugin,
        security: securityPlugin,
        promise: promisePlugin,
        'local-rules': localRulesPlugin,
      },
      settings: {
        'import/resolver': {
          typescript: { project: tsconfigPath },
        },
        [SETTINGS_KEY]: {
          ...DEFAULT_LAYER_PATTERNS,
          ...layerPatterns,
        },
        ...settings,
      },
      rules: {
        // ── TypeScript ────────────────────────────────────────────────
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/consistent-type-exports': 'error',
        '@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/explicit-function-return-type': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',

        // ── Import 순서 ───────────────────────────────────────────────
        'import/no-duplicates': 'error',
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
            'newlines-between': 'always',
            alphabetize: { order: 'asc' },
          },
        ],

        // ── SonarJS ───────────────────────────────────────────────────
        'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
        'sonarjs/cognitive-complexity': ['error', 15],
        'sonarjs/no-identical-functions': 'error',

        // ── Security ──────────────────────────────────────────────────
        'security/detect-object-injection': 'error',

        // ── Promise ───────────────────────────────────────────────────
        'promise/catch-or-return': 'error',
        'promise/always-return': 'error',
        'promise/no-return-wrap': 'error',
        'promise/prefer-await-to-then': 'error',
        'promise/prefer-await-to-callbacks': 'error',
        'promise/no-nesting': 'error',

        // ── ESLint 기본 ───────────────────────────────────────────────
        'no-unused-vars': 'off',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'prefer-destructuring': ['error', { array: false, object: true }],
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-object-spread': 'error',
        eqeqeq: ['error', 'always'],
        'no-empty': ['error', { allowEmptyCatch: false }],
        'no-console': ['error', { allow: ['error'] }],
        'no-unsafe-optional-chaining': 'error',
        'prefer-object-has-own': 'error',
        'no-param-reassign': [
          'error',
          {
            props: true,
            ignorePropertyModificationsFor: [
              'acc', 'accumulator', 'e', 'event', 'req', 'request', 'res', 'response',
            ],
          },
        ],
        'no-warning-comments': [
          'error',
          { terms: ['TODO', 'FIXME', 'HACK', 'XXX'], location: 'start' },
        ],
        'no-magic-numbers': [
          'error',
          { ignore: [0, 1, -1, 100], ignoreArrayIndexes: true, ignoreDefaultValues: true, enforceConst: true },
        ],
        'no-restricted-syntax': [
          'error',
          { selector: 'CallExpression[callee.property.name="sort"]', message: '.sort()는 원본 배열을 변이시킵니다. .toSorted()를 사용하세요.' },
          { selector: 'CallExpression[callee.property.name="reverse"]', message: '.reverse()는 원본 배열을 변이시킵니다. .toReversed()를 사용하세요.' },
          { selector: 'CallExpression[callee.property.name="splice"]', message: '.splice()는 원본 배열을 변이시킵니다. 불변 패턴을 사용하세요.' },
        ],

        // ── Prettier ──────────────────────────────────────────────────
        'prettier/prettier': ['error', { endOfLine: 'auto' }],

        // ── 커스텀 룰 ─────────────────────────────────────────────────
        'local-rules/no-find-in-loop': 'error',
        'local-rules/no-sort-for-minmax': 'error',
        'local-rules/no-includes-in-loop': 'error',
        'local-rules/js-hoist-regexp': 'error',
        'local-rules/js-index-maps': 'error',
        'local-rules/prefer-flatmap': 'error',
        'local-rules/max-file-lines': 'error',
        'local-rules/enforce-filename-convention': 'error',
        'local-rules/require-barrel-export': 'error',
        'local-rules/require-async-error-handling': 'error',
        'local-rules/async-parallel': 'error',
        'local-rules/async-defer-await': 'error',
        'local-rules/require-api-error-throw': 'error',
        'local-rules/require-try-catch-in-api-layer': 'error',
        'local-rules/no-http-status-in-api-layer': 'error',
        'local-rules/require-mutation-error-handler': 'error',
      },
    },

    // ─── API 레이어 전용 ─────────────────────────────────────────────
    {
      files: ['**/api/**/*.ts', '**/services/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
      },
    },

    // ─── TanStack Query 커스텀 룰 ────────────────────────────────────
    ...(useTanstackQuery
      ? [
          {
            files: [filesPattern],
            rules: {
              'local-rules/query-key-no-nonserializable-values': 'error',
              'local-rules/suspense-query-requires-error-boundary': 'error',
              'local-rules/infinite-query-requires-page-param': 'error',
              'local-rules/query-fn-must-use-abort-signal': 'error',
              'local-rules/mutation-must-handle-cache-sync': 'error',
              'local-rules/no-global-invalidate-queries': 'error',
              'local-rules/query-key-must-be-array': 'error',
              'local-rules/query-key-must-use-factory': 'error',
              'local-rules/no-dynamic-usequery-in-loops': 'error',
              'local-rules/query-key-first-segment-static': 'error',
              'local-rules/require-enabled-on-conditional-query': 'error',
            },
          },
        ]
      : []),

    // ─── 테스트 파일: typed linting 비활성화 ───────────────────────
    // tsconfig에 포함되지 않은 테스트 파일은 type-aware 룰을 끈다
    {
      files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      languageOptions: {
        parserOptions: { project: false },
        globals: { ...globals.jest },
      },
      rules: {
        // type-aware 룰 전체 비활성화
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/prefer-readonly': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-magic-numbers': 'off',
        'promise/prefer-await-to-callbacks': 'off',
      },
    },

    // ─── Prettier (항상 마지막) ──────────────────────────────────────
    prettierRecommended,

    ...overrides,
  ];
}

module.exports = { createNativeConfig, createBaseConfig, localRulesPlugin };
