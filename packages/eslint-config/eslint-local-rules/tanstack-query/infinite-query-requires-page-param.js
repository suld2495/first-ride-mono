'use strict';

const MESSAGE = 'useInfiniteQuery에는 반드시 initialPageParam과 getNextPageParam을 명시하세요.';

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
      description: 'useInfiniteQuery에 필수 pagination 옵션을 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      missingInfiniteQueryOptions: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useInfiniteQuery') return;

        const options = node.arguments[0];
        if (!options || options.type !== 'ObjectExpression') return;

        const hasInitialPageParam = Boolean(getObjectProperty(options, 'initialPageParam'));
        const hasGetNextPageParam = Boolean(getObjectProperty(options, 'getNextPageParam'));

        if (hasInitialPageParam && hasGetNextPageParam) return;

        context.report({
          node,
          messageId: 'missingInfiniteQueryOptions',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./infinite-query-requires-page-param');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'infinite-query-requires-page-param',
  rule,
  {
    valid: [
      "useInfiniteQuery({ queryKey: ['posts'], queryFn: fetchPosts, initialPageParam: 0, getNextPageParam: (lastPage) => lastPage.nextPage });",
    ],
    invalid: [
      {
        code: "useInfiniteQuery({ queryKey: ['posts'], queryFn: fetchPosts, initialPageParam: 0 });",
        errors: [{ message: /initialPageParam/ }],
      },
    ],
  }
);
*/
