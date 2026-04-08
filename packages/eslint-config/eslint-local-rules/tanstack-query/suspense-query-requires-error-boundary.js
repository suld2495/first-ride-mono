'use strict';

const MESSAGE =
  'useSuspenseQuery 사용 시 반드시 useQueryErrorResetBoundary를 함께 사용하세요.\n' +
  ' 에러 발생 시 복구할 수 없게 됩니다.';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'suspense query 사용 시 useQueryErrorResetBoundary를 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      missingErrorBoundary: MESSAGE,
    },
  },

  create(context) {
    let hasSuspenseQuery = false;
    let hasErrorResetBoundary = false;

    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier') return;

        if (node.callee.name === 'useSuspenseQuery' || node.callee.name === 'useSuspenseQueries') {
          hasSuspenseQuery = true;
        }

        if (node.callee.name === 'useQueryErrorResetBoundary') {
          hasErrorResetBoundary = true;
        }
      },

      'Program:exit'(node) {
        if (!hasSuspenseQuery || hasErrorResetBoundary) return;

        context.report({
          node,
          messageId: 'missingErrorBoundary',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./suspense-query-requires-error-boundary');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'suspense-query-requires-error-boundary',
  rule,
  {
    valid: [
      "const { reset } = useQueryErrorResetBoundary(); useSuspenseQuery({ queryKey: ['user'], queryFn: fetchUser });",
    ],
    invalid: [
      {
        code: "useSuspenseQuery({ queryKey: ['user'], queryFn: fetchUser });",
        errors: [{ message: /useQueryErrorResetBoundary/ }],
      },
    ],
  }
);
*/
