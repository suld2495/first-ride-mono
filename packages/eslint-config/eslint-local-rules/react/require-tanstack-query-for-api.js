'use strict';

const path = require('path');
const { isHooksFile } = require('../path-groups');

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// import 경로가 api 관련인지 확인합니다.
// 1. *.api 파일명 패턴
// 2. @/features/**/api/** 절대경로
// 3. @/services/** 절대경로
// 4. 상대경로를 절대경로로 변환한 뒤 위 패턴을 검사
function isApiImport(source, filename) {
  // *.api, *.api.ts, *.api.tsx 등
  if (/\.api(\.(ts|tsx|js|jsx))?$/.test(source)) return true;

  // @/features/**/api/**
  if (/^@\/features\/[^/]+\/api(\/|$)/.test(source)) return true;

  // @/services/**
  if (/^@\/services(\/|$)/.test(source)) return true;

  // 상대경로 해석
  if (source.startsWith('.')) {
    const currentDir = path.dirname(normalizePath(filename));
    const resolved = normalizePath(path.resolve(currentDir, source));
    if (/\/features\/[^/]+\/api(\/|$)/.test(resolved)) return true;
    if (/\/src\/services(\/|$)/.test(resolved)) return true;
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'api 호출은 반드시 useQuery 또는 useMutation으로 감싸서 사용하세요.',
      recommended: false,
    },
    messages: {
      requireTanstackQuery:
        'api 호출은 반드시 useQuery 또는 useMutation 으로 감싸서 사용하세요.\n' +
        ' 직접 await 하거나 .then() 으로 호출하지 마세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isHooksFile(context, filename)) return {};

    // import 구문에서 수집한 api 식별자 (authApi, userService 등)
    const apiIdentifiers = new Set();

    /** CallExpression의 callee가 api 식별자인지 확인 */
    function isApiCall(callNode) {
      const { callee } = callNode;

      // apiFunc() — 식별자 직접 호출
      if (callee.type === 'Identifier' && apiIdentifiers.has(callee.name)) {
        return true;
      }

      // apiObj.method() — 멤버 접근 후 호출
      if (
        callee.type === 'MemberExpression' &&
        !callee.computed &&
        callee.object.type === 'Identifier' &&
        apiIdentifiers.has(callee.object.name)
      ) {
        return true;
      }

      return false;
    }

    /**
     * 조상을 순회하여 queryFn / mutationFn 프로퍼티 값으로 사용 중인지 확인.
     * ArrowFunctionExpression | FunctionExpression 이
     * Property(key: queryFn | mutationFn) 의 value 이면 허용.
     */
    function isInsideQueryFn(node) {
      let current = node.parent;
      while (current) {
        if (
          (current.type === 'ArrowFunctionExpression' ||
            current.type === 'FunctionExpression') &&
          current.parent &&
          current.parent.type === 'Property' &&
          current.parent.value === current &&
          !current.parent.computed &&
          current.parent.key &&
          current.parent.key.type === 'Identifier' &&
          (current.parent.key.name === 'queryFn' ||
            current.parent.key.name === 'mutationFn')
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    /**
     * useEffect 콜백 안에 있는지 확인.
     */
    function isInsideUseEffect(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === 'CallExpression' &&
          current.callee.type === 'Identifier' &&
          current.callee.name === 'useEffect'
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    return {
      // ── import 수집 ───────────────────────────
      ImportDeclaration(node) {
        if (!isApiImport(node.source.value, filename)) return;

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' ||
            specifier.type === 'ImportDefaultSpecifier' ||
            specifier.type === 'ImportNamespaceSpecifier'
          ) {
            apiIdentifiers.add(specifier.local.name);
          }
        }
      },

      // ── 금지 패턴 1: await apiCall() ─────────
      AwaitExpression(node) {
        const arg = node.argument;
        if (!arg || arg.type !== 'CallExpression') return;
        if (!isApiCall(arg)) return;
        if (isInsideQueryFn(node)) return;
        context.report({ node, messageId: 'requireTanstackQuery' });
      },

      // ── 금지 패턴 2·3: .then() / useEffect ──
      CallExpression(node) {
        if (isInsideQueryFn(node)) return;

        // 패턴 2: apiCall().then(...)
        if (
          node.callee.type === 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.property.name === 'then' &&
          node.callee.object.type === 'CallExpression' &&
          isApiCall(node.callee.object)
        ) {
          context.report({ node, messageId: 'requireTanstackQuery' });
          return;
        }

        // 패턴 3: useEffect 안에서 apiCall() 직접 호출
        // (await 또는 .then() 체인으로 이미 리포트되는 경우 중복 방지)
        if (isApiCall(node) && isInsideUseEffect(node)) {
          const parent = node.parent;
          const isAwaited = parent?.type === 'AwaitExpression';
          const isPartOfChain =
            parent?.type === 'MemberExpression' && parent.object === node;
          if (!isAwaited && !isPartOfChain) {
            context.report({ node, messageId: 'requireTanstackQuery' });
          }
        }
      },
    };
  },
};
