'use strict';

const MESSAGE =
  'invalidateQueries()를 조건 없이 호출하지 마세요.\n' +
  ' 반드시 queryKey 또는 predicate를 지정하세요.\n' +
  " (예: invalidateQueries({ queryKey: ['users'] }))";

function hasProperty(objectNode, propertyName) {
  if (!objectNode || objectNode.type !== 'ObjectExpression') return false;

  return objectNode.properties.some(
    (property) =>
      property.type === 'Property' &&
      !property.computed &&
      ((property.key.type === 'Identifier' && property.key.name === propertyName) ||
        (property.key.type === 'Literal' && property.key.value === propertyName)),
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '전역 invalidateQueries 호출을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noGlobalInvalidate: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'invalidateQueries'
        ) {
          return;
        }

        if (node.arguments.length === 0) {
          context.report({ node, messageId: 'noGlobalInvalidate' });
          return;
        }

        const firstArgument = node.arguments[0];
        if (firstArgument.type !== 'ObjectExpression') return;

        if (hasProperty(firstArgument, 'queryKey') || hasProperty(firstArgument, 'predicate')) {
          return;
        }

        context.report({
          node: firstArgument,
          messageId: 'noGlobalInvalidate',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./no-global-invalidate-queries');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'no-global-invalidate-queries',
  rule,
  {
    valid: [
      "queryClient.invalidateQueries({ queryKey: ['users'] });",
      'queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "users" });',
    ],
    invalid: [
      {
        code: 'queryClient.invalidateQueries();',
        errors: [{ message: /queryKey 또는 predicate/ }],
      },
    ],
  }
);
*/
