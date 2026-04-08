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
  'queryKey의 첫 번째 세그먼트는 반드시 고정 문자열 리터럴이어야 합니다.\n' +
  " (예: ['users', id], ['todos', filter])";

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

function isStringLiteral(node) {
  return node?.type === 'Literal' && typeof node.value === 'string';
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'queryKey 첫 세그먼트를 고정 문자열 리터럴로 제한합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      firstSegmentMustBeStatic: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!TARGET_FUNCTIONS.has(getCalleeName(node.callee))) return;

        const queryKeyProperty = getObjectProperty(node.arguments[0], 'queryKey');
        if (!queryKeyProperty) return;

        const { value } = queryKeyProperty;
        if (value.type === 'CallExpression') return;
        if (value.type !== 'ArrayExpression') return;

        const firstElement = value.elements[0];
        if (!firstElement || isStringLiteral(firstElement)) return;

        context.report({
          node: firstElement,
          messageId: 'firstSegmentMustBeStatic',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./query-key-first-segment-static');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'query-key-first-segment-static',
  rule,
  {
    valid: ["useQuery({ queryKey: ['users', id] })", 'useQuery({ queryKey: todoKeys.detail(id) })'],
    invalid: [
      {
        code: 'useQuery({ queryKey: [entityName, id] })',
        errors: [{ message: /첫 번째 세그먼트/ }],
      },
    ],
  }
);
*/
