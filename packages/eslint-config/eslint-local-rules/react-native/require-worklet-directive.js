'use strict';

const TARGET_CALLS = new Set(['runOnUI', 'scheduleOnUI', 'runOnJS']);

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function isFunctionNode(node) {
  return node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';
}

function getCalleeName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
    return node.property.name;
  }
  return null;
}

function hasWorkletDirective(functionNode) {
  if (!isFunctionNode(functionNode) || functionNode.body.type !== 'BlockStatement') {
    return false;
  }

  const [firstStatement] = functionNode.body.body;
  return (
    firstStatement?.type === 'ExpressionStatement' &&
    firstStatement.expression.type === 'Literal' &&
    firstStatement.expression.value === 'worklet'
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "inline worklet 함수에는 첫 줄 'worklet' 지시문을 강제합니다.",
      recommended: false,
    },
    messages: {
      requireWorkletDirective: "worklet 함수에는 반드시 첫 줄에 'worklet' 지시문을 추가하세요.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      CallExpression(node) {
        const calleeName = getCalleeName(node.callee);
        if (!TARGET_CALLS.has(calleeName)) return;

        const [firstArgument] = node.arguments;
        if (!isFunctionNode(firstArgument)) return;
        if (hasWorkletDirective(firstArgument)) return;

        context.report({
          node: firstArgument,
          messageId: 'requireWorkletDirective',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./require-worklet-directive');
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
// tester.run('require-worklet-directive', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: "runOnUI(() => { 'worklet'; progress.value = 1; });",
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'scheduleOnUI(() => { progress.value = 1; });',
//       errors: [{ messageId: 'requireWorkletDirective' }],
//     },
//   ],
// });
