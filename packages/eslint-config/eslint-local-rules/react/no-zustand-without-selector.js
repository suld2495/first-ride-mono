'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function isZustandStoreHookCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    /^use[A-Za-z0-9]*Store$/.test(node.callee.name)
  );
}

function isFunctionSelector(node) {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Zustand store는 selector 없이 호출할 수 없습니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      requireSelector:
        'Zustand store는 반드시 selector를 사용해서 호출하세요. 전체 store 구독은 불필요한 리렌더를 발생시킵니다. (예: useAuthStore((s) => s.user))',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      CallExpression(node) {
        if (!isZustandStoreHookCall(node)) return;

        const [selector] = node.arguments;
        if (!selector || !isFunctionSelector(selector)) {
          context.report({
            node,
            messageId: 'requireSelector',
          });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-zustand-without-selector');
//
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: tsParser,
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
//
// tester.run('no-zustand-without-selector', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const user = useAuthStore((s) => s.user);',
//     },
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const login = useAuthStore(function (s) { return s.login; });',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const store = useAuthStore();',
//       errors: [{ messageId: 'requireSelector' }],
//     },
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const user = useAuthStore("user");',
//       errors: [{ messageId: 'requireSelector' }],
//     },
//   ],
// });
