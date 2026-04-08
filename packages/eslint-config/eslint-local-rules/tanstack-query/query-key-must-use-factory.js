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
  'queryKey를 직접 배열로 작성하지 마세요.\n' +
  ' query key factory를 사용하세요.\n' +
  ' (예: todoKeys.all(), todoKeys.detail(id))';

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

function getMemberObjectName(memberExpression) {
  if (!memberExpression || memberExpression.type !== 'MemberExpression') return null;

  let current = memberExpression.object;

  while (current && current.type === 'MemberExpression') {
    current = current.object;
  }

  return current?.type === 'Identifier' ? current.name : null;
}

function isAllowedFactoryCall(node) {
  if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') return false;

  const objectName = getMemberObjectName(node.callee);
  return Boolean(objectName && /(?:Keys|Queries)$/.test(objectName));
}

function isAllowedFactoryMember(node) {
  return (
    node.type === 'MemberExpression' &&
    !node.computed &&
    node.property.type === 'Identifier' &&
    node.property.name === 'queryKey'
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'queryKey 직접 배열 작성을 금지하고 factory 사용을 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      queryKeyMustUseFactory: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!TARGET_FUNCTIONS.has(getCalleeName(node.callee))) return;

        const queryKeyProperty = getObjectProperty(node.arguments[0], 'queryKey');
        if (!queryKeyProperty) return;

        const { value } = queryKeyProperty;
        if (isAllowedFactoryCall(value) || isAllowedFactoryMember(value)) return;

        context.report({
          node: value,
          messageId: 'queryKeyMustUseFactory',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./query-key-must-use-factory');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'query-key-must-use-factory',
  rule,
  {
    valid: ['useQuery({ queryKey: todoKeys.all() })', 'useQuery({ queryKey: userQueries.list().queryKey })'],
    invalid: [
      {
        code: "useQuery({ queryKey: ['todos', id] })",
        errors: [{ message: /factory/ }],
      },
    ],
  }
);
*/
