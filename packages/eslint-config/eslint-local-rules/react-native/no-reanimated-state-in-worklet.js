'use strict';

const WORKLET_HOOKS = new Set([
  'useAnimatedStyle',
  'useAnimatedProps',
  'useDerivedValue',
  'useAnimatedScrollHandler',
  'useAnimatedGestureHandler',
]);

const STATE_HOOKS = new Set(['useState', 'useReducer']);

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function isFunctionNode(node) {
  return (
    node?.type === 'ArrowFunctionExpression' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'FunctionDeclaration'
  );
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

function collectStateNamesFromDeclarator(declaration, target) {
  if (declaration.id.type !== 'ArrayPattern' || declaration.init?.type !== 'CallExpression') {
    return;
  }

  const hookName = getCalleeName(declaration.init.callee);
  if (!STATE_HOOKS.has(hookName)) return;

  for (const element of declaration.id.elements) {
    if (element?.type === 'Identifier') {
      target.add(element.name);
    }
  }
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

function getWorkletFunctionFromCall(node) {
  const calleeName = getCalleeName(node.callee);
  if (!WORKLET_HOOKS.has(calleeName)) return null;

  const [firstArgument] = node.arguments;
  return isFunctionNode(firstArgument) ? firstArgument : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Reanimated worklet 함수 안에서 React state 참조를 금지합니다.',
      recommended: false,
    },
    messages: {
      noStateInWorklet:
        'worklet 함수 안에서 React state를 직접 참조하지 마세요. useSharedValue를 사용하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    let reactStateNames = new Set();

    function reportStateUsage(functionNode) {
      const reportedNames = new Set();
      const rootNode = functionNode.body;

      traverse(rootNode, (node) => {
        if (
          node.type === 'Identifier' &&
          reactStateNames.has(node.name) &&
          !reportedNames.has(node.name)
        ) {
          reportedNames.add(node.name);
          context.report({
            node,
            messageId: 'noStateInWorklet',
          });
        }
      });
    }

    return {
      Program() {
        reactStateNames = new Set();
      },

      VariableDeclarator(node) {
        collectStateNamesFromDeclarator(node, reactStateNames);
      },

      CallExpression(node) {
        const workletFunction = getWorkletFunctionFromCall(node);
        if (!workletFunction) return;

        reportStateUsage(workletFunction);
      },

      'FunctionExpression, ArrowFunctionExpression'(node) {
        if (!hasWorkletDirective(node)) return;

        const parent = node.parent;
        if (parent?.type === 'CallExpression' && getWorkletFunctionFromCall(parent) === node) {
          return;
        }

        reportStateUsage(node);
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-reanimated-state-in-worklet');
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
// tester.run('no-reanimated-state-in-worklet', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: 'const progress = useSharedValue(0); const style = useAnimatedStyle(() => ({ opacity: progress.value }));',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: "const [count, setCount] = useState(0); const style = useAnimatedStyle(() => ({ opacity: count > 0 ? 1 : 0 }));",
//       errors: [{ messageId: 'noStateInWorklet' }],
//     },
//     {
//       filename: '/project/src/features/anim/view.tsx',
//       code: "const [count, setCount] = useState(0); useAnimatedStyle(() => { 'worklet'; setCount(1); return {}; });",
//       errors: [{ messageId: 'noStateInWorklet' }],
//     },
//   ],
// });
