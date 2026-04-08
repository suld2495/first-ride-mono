'use strict';

const path = require('path');

const SETTINGS_KEY = 'local-rules/filename-convention';
const DEFAULT_PATTERNS = Object.freeze({
  component: ['src/components/**', 'src/features/*/components/**'],
  hook: ['src/hooks/**', 'src/features/*/hooks/**'],
  api: ['src/services/**', 'src/features/*/api/**'],
  store: ['src/store/**'],
  constant: ['src/constants/**'],
  util: ['src/utils/**'],
  type: ['src/types/**'],
  featureTypes: ['src/features/*/types.ts'],
});

const regexCache = new Map();

function normalizePath(value = '') {
  return value.replace(/\\/g, '/');
}

function getContextCwd(context) {
  return normalizePath(context.cwd ?? process.cwd());
}

function getProjectRelativePath(context, value) {
  const normalizedValue = normalizePath(value);

  if (!path.isAbsolute(normalizedValue)) {
    return normalizedValue.replace(/^\.?\//, '');
  }

  return normalizePath(path.relative(getContextCwd(context), normalizedValue));
}

function normalizePattern(pattern) {
  return normalizePath(pattern).replace(/^\.?\//, '').replace(/\/+$/, '');
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(pattern) {
  const cached = regexCache.get(pattern);
  if (cached) return cached;

  const normalizedPattern = normalizePattern(pattern)
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '__SINGLE_STAR__');

  const regexBody = escapeRegExp(normalizedPattern)
    .replace(/__DOUBLE_STAR__/g, '.*')
    .replace(/__SINGLE_STAR__/g, '[^/]*');

  const compiled = new RegExp(`(?:^|.*/)${regexBody}$`);
  regexCache.set(pattern, compiled);
  return compiled;
}

function matchesPatternList(targetPath, patterns) {
  return patterns.some((pattern) => globToRegExp(pattern).test(targetPath));
}

function getConventionPatterns(context) {
  return {
    ...DEFAULT_PATTERNS,
    ...(context.settings?.[SETTINGS_KEY] ?? {}),
  };
}

// ─────────────────────────────────────────────
//  컨벤션별 파일명 정규식
// ─────────────────────────────────────────────

/** kebab-case  (예: user-profile, format-date) */
const KEBAB_CASE_TS  = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.ts$/;
const KEBAB_CASE_TSX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.tsx$/;
/** use로 시작하는 camelCase  (예: useAuth, useUserProfile) */
const HOOK_NAME = /^use[A-Z][a-zA-Z0-9]*\.ts$/;

/** UPPER_SNAKE_CASE  (예: API_ENDPOINTS, COLOR_TOKENS) */
const UPPER_SNAKE_CASE = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*\.ts$/;

/** [domain].store.ts  (예: auth.store.ts) */
const STORE_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.store\.ts$/;

/** [domain].api.ts  (예: auth.api.ts) */
const API_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.api\.ts$/;

// ─────────────────────────────────────────────
//  카테고리 판별
// ─────────────────────────────────────────────

/**
 * 정규화된 파일 경로를 받아 적용해야 할 컨벤션 카테고리를 반환한다.
 * 확장자가 기대 값과 다르면 null을 반환하여 검사를 건너뛴다.
 */
function getConvention(context, normalizedPath) {
  const ext = path.extname(normalizedPath);
  const patterns = getConventionPatterns(context);

  // .tsx — 컴포넌트만 해당
  if (ext === '.tsx') {
    if (matchesPatternList(normalizedPath, patterns.component ?? [])) {
      return 'component';
    }
    return null;
  }

  // .ts — 나머지 카테고리
  if (ext === '.ts') {
    if (matchesPatternList(normalizedPath, patterns.hook ?? [])) {
      return 'hook';
    }

    if (matchesPatternList(normalizedPath, patterns.api ?? [])) {
      return 'api';
    }

    if (matchesPatternList(normalizedPath, patterns.store ?? [])) {
      return 'store';
    }

    if (matchesPatternList(normalizedPath, patterns.constant ?? [])) {
      return 'constant';
    }

    if (matchesPatternList(normalizedPath, patterns.util ?? [])) {
      return 'util';
    }

    if (matchesPatternList(normalizedPath, patterns.type ?? [])) {
      return 'type';
    }
  }

  return null;
}

// ─────────────────────────────────────────────
//  예외 파일 판별
// ─────────────────────────────────────────────

/**
 * 컨벤션 검사를 건너뛰어야 하는 파일인지 확인한다.
 * - index.ts / index.tsx (배럴 익스포트)
 * - _ 로 시작하는 파일 (_layout.tsx 등 Expo Router 예약 파일)
 * - + 로 시작하는 파일 (+not-found.tsx 등 Expo Router 특수 파일)
 * - src/features/**\/types.ts (feature 내부 고정 타입 파일)
 */
function isExempt(context, basename, normalizedPath) {
  if (/\.(test|spec)\.(ts|tsx)$/.test(basename)) return true;

  const patterns = getConventionPatterns(context);

  if (/^index\.(ts|tsx)$/.test(basename)) return true;
  if (basename.startsWith('_')) return true;
  if (basename.startsWith('+')) return true;
  if (
    basename === 'types.ts' &&
    matchesPatternList(normalizedPath, patterns.featureTypes ?? [])
  ) {
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────
//  카테고리 → 검증 설정 맵
// ─────────────────────────────────────────────

const VALIDATORS = {
  component: {
    isValid: (name) => KEBAB_CASE_TSX.test(name),
    messageId: 'componentFile',
  },
  hook: {
    isValid: (name) => HOOK_NAME.test(name),
    messageId: 'hookFile',
  },
  util: {
    isValid: (name) => KEBAB_CASE_TS.test(name),
    messageId: 'utilFile',
  },
  constant: {
    isValid: (name) => UPPER_SNAKE_CASE.test(name),
    messageId: 'constantFile',
  },
  store: {
    isValid: (name) => STORE_NAME.test(name),
    messageId: 'storeFile',
  },
  api: {
    isValid: (name) => API_NAME.test(name),
    messageId: 'apiFile',
  },
  type: {
    isValid: (name) => KEBAB_CASE_TS.test(name),
    messageId: 'typeFile',
  },
};

// ─────────────────────────────────────────────
//  Rule
// ─────────────────────────────────────────────

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '파일 위치에 따라 파일명 컨벤션을 강제한다.',
      recommended: true,
    },
    messages: {
      componentFile: '컴포넌트 파일명은 kebab-case를 사용하세요. (예: user-profile.tsx)',
      hookFile:      '훅 파일명은 use로 시작하는 PascalCase를 사용하세요. (예: useAuth.ts)',
      utilFile:      '유틸 파일명은 kebab-case를 사용하세요. (예: format-date.ts)',
      constantFile:  '상수 파일명은 UPPER_SNAKE_CASE를 사용하세요. (예: API_ENDPOINTS.ts)',
      storeFile:     '스토어 파일명은 [domain].store.ts 형식을 사용하세요. (예: auth.store.ts)',
      apiFile:       'API 파일명은 [domain].api.ts 형식을 사용하세요. (예: auth.api.ts)',
      typeFile:      '타입 파일명은 kebab-case를 사용하세요. (예: user-types.ts)',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const filename =
          typeof context.filename === 'string'
            ? context.filename
            : context.getFilename();

        // 파일명을 알 수 없는 경우(테스트 환경 기본값 등) 스킵
        if (!filename || filename === '<input>') return;

        const normalized = normalizePath(filename);
        const relativePath = getProjectRelativePath(context, normalized);
        const basename   = path.basename(normalized);

        if (isExempt(context, basename, relativePath)) return;

        const convention = getConvention(context, relativePath);
        if (!convention) return;

        const validator = VALIDATORS[convention];
        if (!validator.isValid(basename)) {
          context.report({ node, messageId: validator.messageId });
        }
      },
    };
  },
};

/*
 * ─────────────────────────────────────────────
 *  RuleTester 테스트 케이스
 * ─────────────────────────────────────────────
 *
 * const { RuleTester } = require('eslint');
 * const rule = require('./enforce-filename-convention');
 *
 * const tester = new RuleTester({
 *   languageOptions: {
 *     parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
 *   },
 * });
 *
 * tester.run('enforce-filename-convention', rule, {
 *   valid: [
 *     // ✅ 컴포넌트 — kebab-case.tsx
 *     { code: '', filename: '/p/src/components/user-profile.tsx' },
 *     { code: '', filename: '/p/src/components/auth-button.tsx' },
 *     { code: '', filename: '/p/src/features/auth/components/auth-form.tsx' },
 *
 *     // ✅ 훅 — useXxx.ts
 *     { code: '', filename: '/p/src/hooks/useAuth.ts' },
 *     { code: '', filename: '/p/src/hooks/useUserProfile.ts' },
 *     { code: '', filename: '/p/src/features/auth/hooks/useAuthForm.ts' },
 *
 *     // ✅ 유틸 — kebab-case.ts
 *     { code: '', filename: '/p/src/utils/format-date.ts' },
 *     { code: '', filename: '/p/src/utils/parse-token.ts' },
 *
 *     // ✅ 상수 — UPPER_SNAKE_CASE.ts
 *     { code: '', filename: '/p/src/constants/API_ENDPOINTS.ts' },
 *     { code: '', filename: '/p/src/constants/COLOR_TOKENS.ts' },
 *
 *     // ✅ 스토어 — [domain].store.ts
 *     { code: '', filename: '/p/src/store/auth.store.ts' },
 *     { code: '', filename: '/p/src/store/user-profile.store.ts' },
 *
 *     // ✅ API — [domain].api.ts
 *     { code: '', filename: '/p/src/services/auth.api.ts' },
 *     { code: '', filename: '/p/src/features/payment/api/payment.api.ts' },
 *
 *     // ✅ 타입 — kebab-case.ts
 *     { code: '', filename: '/p/src/types/user-types.ts' },
 *     { code: '', filename: '/p/src/types/auth-types.ts' },
 *
 *     // ✅ 예외 — index 파일
 *     { code: '', filename: '/p/src/components/index.tsx' },
 *     { code: '', filename: '/p/src/hooks/index.ts' },
 *
 *     // ✅ 예외 — Expo Router 예약 파일
 *     { code: '', filename: '/p/src/app/_layout.tsx' },
 *     { code: '', filename: '/p/src/app/+not-found.tsx' },
 *
 *     // ✅ 예외 — features 내부 types.ts
 *     { code: '', filename: '/p/src/features/auth/types.ts' },
 *
 *     // ✅ 규칙 미적용 경로 — src/app/ 라우트 파일
 *     { code: '', filename: '/p/src/app/(tabs)/index.tsx' },
 *   ],
 *
 *   invalid: [
 *     // ❌ 컴포넌트 — PascalCase 사용
 *     {
 *       code: '',
 *       filename: '/p/src/components/UserProfile.tsx',
 *       errors: [{ messageId: 'componentFile' }],
 *     },
 *     // ❌ 컴포넌트 — camelCase 사용
 *     {
 *       code: '',
 *       filename: '/p/src/features/auth/components/authForm.tsx',
 *       errors: [{ messageId: 'componentFile' }],
 *     },
 *     // ❌ 훅 — 소문자 시작
 *     {
 *       code: '',
 *       filename: '/p/src/hooks/useauth.ts',
 *       errors: [{ messageId: 'hookFile' }],
 *     },
 *     // ❌ 훅 — use 접두사 없음
 *     {
 *       code: '',
 *       filename: '/p/src/hooks/AuthHook.ts',
 *       errors: [{ messageId: 'hookFile' }],
 *     },
 *     // ❌ 유틸 — PascalCase 사용
 *     {
 *       code: '',
 *       filename: '/p/src/utils/FormatDate.ts',
 *       errors: [{ messageId: 'utilFile' }],
 *     },
 *     // ❌ 상수 — camelCase 사용
 *     {
 *       code: '',
 *       filename: '/p/src/constants/apiEndpoints.ts',
 *       errors: [{ messageId: 'constantFile' }],
 *     },
 *     // ❌ 스토어 — .store.ts 접미사 없음
 *     {
 *       code: '',
 *       filename: '/p/src/store/authStore.ts',
 *       errors: [{ messageId: 'storeFile' }],
 *     },
 *     // ❌ API — .api.ts 접미사 없음
 *     {
 *       code: '',
 *       filename: '/p/src/services/authService.ts',
 *       errors: [{ messageId: 'apiFile' }],
 *     },
 *     // ❌ features api — .api.ts 접미사 없음
 *     {
 *       code: '',
 *       filename: '/p/src/features/auth/api/authApi.ts',
 *       errors: [{ messageId: 'apiFile' }],
 *     },
 *     // ❌ 타입 — PascalCase 사용
 *     {
 *       code: '',
 *       filename: '/p/src/types/UserTypes.ts',
 *       errors: [{ messageId: 'typeFile' }],
 *     },
 *   ],
 * });
 */
