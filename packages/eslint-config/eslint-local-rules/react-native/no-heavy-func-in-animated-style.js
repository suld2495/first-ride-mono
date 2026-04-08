'use strict';

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

function isAnimatedStyleCall(node) {
  return node.type === 'CallExpression' && getCalleeName(node.callee) === 'useAnimatedStyle';
}

function getChainDepth(node) {
  let depth = 0;
  let current = node;

  while (current?.type === 'CallExpression' && current.callee.type === 'MemberExpression') {
    const property = current.callee.property;
    if (property.type !== 'Identifier') break;
    depth += 1;
    current = current.callee.object;
  }

  return depth;
}

function pushChildNodes(stack, node) {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || !value) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object' && typeof item.type === 'string') {
          stack.push(item);
        }
      }
      continue;
    }

    if (typeof value === 'object' && typeof value.type === 'string') {
      stack.push(value);
    }
  }
}

function traverse(node, visitor) {
  const stack = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    visitor(current);

    if (current !== node && isFunctionNode(current)) {
      continue;
    }

    pushChildNodes(stack, current);
  }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'useAnimatedStyle 안에서 무거운 연산을 금지합니다.',
      recommended: false,
    },
    messages: {
      noHeavyFunc:
        'useAnimatedStyle 안에서 무거운 연산을 하지 마세요. UI thread를 블로킹합니다. 값은 useDerivedValue로 미리 계산하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      CallExpression(node) {
        if (!isAnimatedStyleCall(node)) return;

        const [workletFunction] = node.arguments;
        if (!isFunctionNode(workletFunction)) return;

        let externalCallCount = 0;
        let reported = false;

        traverse(workletFunction.body, (current) => {
          if (reported || current.type !== 'CallExpression') return;

          const calleeName = getCalleeName(current.callee);

          if (
            current.callee.type === 'MemberExpression' &&
            current.callee.object.type === 'Identifier' &&
            current.callee.object.name === 'JSON' &&
            (calleeName === 'parse' || calleeName === 'stringify')
          ) {
            reported = true;
            context.report({ node: current, messageId: 'noHeavyFunc' });
            return;
          }

          if (getChainDepth(current) >= 3) {
            reported = true;
            context.report({ node: current, messageId: 'noHeavyFunc' });
            return;
          }

          externalCallCount += 1;
          if (externalCallCount >= 3) {
            reported = true;
            context.report({ node: current, messageId: 'noHeavyFunc' });
          }
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-heavy-func-in-animated-style');
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
// tester.run('no-heavy-func-in-animated-style', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: scale.value }] }));',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'useAnimatedStyle(() => { const result = items.filter(Boolean).map(String).reduce((a, b) => a + b, ""); return { opacity: result.length }; });',
//       errors: [{ messageId: 'noHeavyFunc' }],
//     },
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'useAnimatedStyle(() => { const parsed = JSON.parse(data); return { opacity: parsed.value }; });',
//       errors: [{ messageId: 'noHeavyFunc' }],
//     },
//   ],
// });
