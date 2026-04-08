'use strict';

const TARGET_FUNCTIONS = new Set([
  'useQuery',
  'useInfiniteQuery',
  'useQueries',
  'prefetchQuery',
  'ensureQueryData',
  'invalidateQueries',
  'setQueryData',
]);

const MESSAGE =
  'queryKey에 직렬화 불가능한 값을 사용하지 마세요.\n' +
  ' 함수, Date, Map, Set, Symbol은 캐시 키로 불안정합니다.';

function getCalleeName(node) {
  if (!node) return null;

  if (node.type === 'Identifier') {
    return node.name;
  }

  if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
    return node.property.name;
  }

  return null;
}

function getObjectProperty(objectNode, propertyName) {
  if (!objectNode || objectNode.type !== 'ObjectExpression') return null;

  return (
    objectNode.properties.find(
      (property) =>
        property.type === 'Property' &&
        !property.computed &&
        ((property.key.type === 'Identifier' && property.key.name === propertyName) ||
          (property.key.type === 'Literal' && property.key.value === propertyName)),
    ) ?? null
  );
}

function isForbiddenNode(node) {
  if (!node) return false;

  if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
    return true;
  }

  if (
    node.type === 'NewExpression' &&
    node.callee.type === 'Identifier' &&
    ['Date', 'Map', 'Set'].includes(node.callee.name)
  ) {
    return true;
  }

  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'Symbol'
  );
}

function findForbiddenValue(root) {
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (isForbiddenNode(current)) {
      return current;
    }

    if (current.type === 'ArrayExpression') {
      stack.push(...current.elements);
      continue;
    }

    if (current.type === 'ObjectExpression') {
      for (const property of current.properties) {
        if (property.type === 'Property') {
          stack.push(property.value);
        }
      }
    }
  }

  return null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'queryKey 안에 직렬화 불가능한 값을 넣지 못하게 합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noNonserializableValues: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!TARGET_FUNCTIONS.has(getCalleeName(node.callee))) return;

        const options = node.arguments[0];
        const queryKeyProperty = getObjectProperty(options, 'queryKey');
        if (!queryKeyProperty) return;

        const forbiddenNode = findForbiddenValue(queryKeyProperty.value);
        if (!forbiddenNode) return;

        context.report({
          node: forbiddenNode,
          messageId: 'noNonserializableValues',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./query-key-no-nonserializable-values');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'query-key-no-nonserializable-values',
  rule,
  {
    valid: [
      "useQuery({ queryKey: ['users', userId] })",
      "useQuery({ queryKey: ['users', { id: userId }] })",
    ],
    invalid: [
      {
        code: "useQuery({ queryKey: ['users', () => {}] })",
        errors: [{ message: /직렬화 불가능한 값/ }],
      },
    ],
  }
);
*/
