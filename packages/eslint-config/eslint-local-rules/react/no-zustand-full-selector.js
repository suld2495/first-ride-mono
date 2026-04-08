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

function returnsParameterDirectly(selector) {
  const [parameter] = selector.params;
  if (!parameter || parameter.type !== 'Identifier') return false;

  if (selector.body.type === 'Identifier') {
    return selector.body.name === parameter.name;
  }

  if (selector.body.type !== 'BlockStatement') return false;

  for (const statement of selector.body.body) {
    if (statement.type !== 'ReturnStatement') continue;
    return statement.argument?.type === 'Identifier' && statement.argument.name === parameter.name;
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '(s) => s 형태의 Zustand 전체 selector 사용을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noFullSelector:
        '(s) => s 형태의 전체 selector는 사용하지 마세요. 전체 구독과 동일하여 불필요한 리렌더가 발생합니다. 필요한 필드만 선택하세요. (예: (s) => s.user)',
    },
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      CallExpression(node) {
        if (!isZustandStoreHookCall(node)) return;

        const [selector] = node.arguments;
        if (!isFunctionSelector(selector)) return;
        if (!returnsParameterDirectly(selector)) return;

        context.report({
          node: selector,
          messageId: 'noFullSelector',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-zustand-full-selector');
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
// tester.run('no-zustand-full-selector', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const user = useAuthStore((s) => s.user);',
//     },
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const login = useAuthStore(function (state) { return state.login; });',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const state = useAuthStore((s) => s);',
//       errors: [{ messageId: 'noFullSelector' }],
//     },
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: 'const all = useAuthStore((state) => { return state; });',
//       errors: [{ messageId: 'noFullSelector' }],
//     },
//   ],
// });
