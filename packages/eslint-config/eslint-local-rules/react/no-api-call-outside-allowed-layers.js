'use strict';
const { isApiLayerFile } = require('../path-groups');

/**
 * fetch(...) 호출인지 확인한다.
 * - callee: Identifier { name: 'fetch' }
 */
function isFetchCall(node) {
  return (
    node.callee.type === 'Identifier' &&
    node.callee.name === 'fetch'
  );
}

/**
 * axios.method(...) 호출인지 확인한다.
 * - callee: MemberExpression { object: { name: 'axios' }, property: { name: METHOD } }
 * - window.fetch(...) 도 감지한다
 */
const AXIOS_METHODS = new Set([
  'get', 'post', 'put', 'delete', 'patch', 'request', 'head', 'options',
]);

function isAxiosCall(node) {
  const callee = node.callee;
  if (callee.type !== 'MemberExpression') return false;
  if (callee.computed) return false;

  const objectName =
    callee.object.type === 'Identifier' ? callee.object.name : null;
  const methodName =
    callee.property.type === 'Identifier' ? callee.property.name : null;

  return objectName === 'axios' && methodName !== null && AXIOS_METHODS.has(methodName);
}

/**
 * window.fetch(...) 호출인지 확인한다.
 */
function isWindowFetchCall(node) {
  const callee = node.callee;
  if (callee.type !== 'MemberExpression') return false;
  if (callee.computed) return false;

  return (
    callee.object.type === 'Identifier' &&
    callee.object.name === 'window' &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'fetch'
  );
}

function isApiCall(node) {
  return isFetchCall(node) || isAxiosCall(node) || isWindowFetchCall(node);
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'API 호출(fetch, axios)은 api 레이어에서만 허용',
      recommended: true,
    },
    messages: {
      noApiCall:
        'API 호출은 api 레이어에서만 허용됩니다.',
    },
    schema: [],
  },

  create(context) {
    const filename =
      typeof context.filename === 'string'
        ? context.filename
        : context.getFilename();

    // 허용된 레이어에서는 룰 미적용
    if (isApiLayerFile(context, filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        if (isApiCall(node)) {
          context.report({ node, messageId: 'noApiCall' });
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
 * const rule = require('./no-api-call-outside-allowed-layers');
 *
 * const tester = new RuleTester({
 *   languageOptions: {
 *     parserOptions: {
 *       ecmaVersion: 2020,
 *       sourceType: 'module',
 *     },
 *   },
 * });
 *
 * tester.run('no-api-call-outside-allowed-layers', rule, {
 *   valid: [
 *     // ✅ src/services/ — fetch 허용
 *     {
 *       code: `fetch('https://api.example.com/users');`,
 *       filename: '/project/src/services/userService.ts',
 *     },
 *     // ✅ src/services/ — axios.get 허용
 *     {
 *       code: `axios.get('/users');`,
 *       filename: '/project/src/services/userService.ts',
 *     },
 *     // ✅ src/features/[name]/api/ — fetch 허용
 *     {
 *       code: `fetch('/auth/login');`,
 *       filename: '/project/src/features/auth/api/authApi.ts',
 *     },
 *     // ✅ src/features/[name]/api/ — axios.post 허용
 *     {
 *       code: `axios.post('/login', data);`,
 *       filename: '/project/src/features/auth/api/authApi.ts',
 *     },
 *     // ✅ src/features/[name]/api/ 하위 중첩 파일
 *     {
 *       code: `axios.get('/payments');`,
 *       filename: '/project/src/features/payment/api/paymentApi.ts',
 *     },
 *     // ✅ fetch가 아닌 다른 함수 호출 — hooks
 *     {
 *       code: `doSomething('/users');`,
 *       filename: '/project/src/hooks/useUser.ts',
 *     },
 *     // ✅ axios import만 있고 호출 없음
 *     {
 *       code: `import axios from 'axios';`,
 *       filename: '/project/src/components/Button.tsx',
 *     },
 *     // ✅ axios 객체 생성 (create) — HTTP 요청이 아님
 *     {
 *       code: `const instance = axios.create({ baseURL: '/api' });`,
 *       filename: '/project/src/hooks/useUser.ts',
 *     },
 *     // ✅ 다른 객체의 get 메서드 호출
 *     {
 *       code: `cache.get('key');`,
 *       filename: '/project/src/hooks/useUser.ts',
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ hooks에서 fetch 직접 호출
 *     {
 *       code: `fetch('https://api.example.com/users');`,
 *       filename: '/project/src/hooks/useUser.ts',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ components에서 axios.get 호출
 *     {
 *       code: `axios.get('/users');`,
 *       filename: '/project/src/components/UserList.tsx',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ store에서 axios.post 호출
 *     {
 *       code: `axios.post('/login', credentials);`,
 *       filename: '/project/src/store/authStore.ts',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ app 레이어에서 fetch 호출
 *     {
 *       code: `fetch('/api/data');`,
 *       filename: '/project/src/app/(tabs)/index.tsx',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ features 하위이지만 api/ 가 아닌 경로
 *     {
 *       code: `axios.get('/users');`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ window.fetch 호출
 *     {
 *       code: `window.fetch('/api/data');`,
 *       filename: '/project/src/hooks/useUser.ts',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ axios.delete 호출
 *     {
 *       code: `axios.delete('/users/1');`,
 *       filename: '/project/src/components/UserCard.tsx',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ axios.patch 호출
 *     {
 *       code: `axios.patch('/users/1', data);`,
 *       filename: '/project/src/store/userStore.ts',
 *       errors: [{ messageId: 'noApiCall' }],
 *     },
 *     // ❌ 동일 파일 내 복수의 API 호출
 *     {
 *       code: `
 *         fetch('/users');
 *         axios.post('/login', data);
 *       `,
 *       filename: '/project/src/hooks/useData.ts',
 *       errors: [
 *         { messageId: 'noApiCall' },
 *         { messageId: 'noApiCall' },
 *       ],
 *     },
 *   ],
 * });
 */
