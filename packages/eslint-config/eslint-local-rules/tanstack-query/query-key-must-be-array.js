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

const MESSAGE = 'queryKey는 반드시 배열이어야 합니다.\n' + " (예: queryKey: ['todos', id])";

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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'queryKey를 배열 또는 팩토리 호출로 제한합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      queryKeyMustBeArray: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!TARGET_FUNCTIONS.has(getCalleeName(node.callee))) return;

        const queryKeyProperty = getObjectProperty(node.arguments[0], 'queryKey');
        if (!queryKeyProperty) return;

        const { value } = queryKeyProperty;
        if (value.type === 'ArrayExpression' || value.type === 'CallExpression') return;

        context.report({
          node: value,
          messageId: 'queryKeyMustBeArray',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./query-key-must-be-array');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'query-key-must-be-array',
  rule,
  {
    valid: ["useQuery({ queryKey: ['todos'] })", 'useQuery({ queryKey: todoKeys.all() })'],
    invalid: [
      {
        code: "useQuery({ queryKey: 'todos' })",
        errors: [{ message: /반드시 배열/ }],
      },
    ],
  }
);
*/
