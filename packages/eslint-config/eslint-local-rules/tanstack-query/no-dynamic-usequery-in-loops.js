'use strict';

const MESSAGE =
  '루프나 조건문 안에서 useQuery를 사용하지 마세요.\n' +
  ' React hooks 규칙 위반입니다.\n' +
  ' 동적 병렬 조회는 useQueries를 사용하세요.';

function isCallbackFunction(node) {
  if (node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression') {
    return false;
  }

  const parent = node.parent;
  return parent?.type === 'CallExpression' && parent.arguments.includes(node);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '루프와 조건문 안의 동적 useQuery 호출을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noDynamicUseQuery: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useQuery') return;

        let current = node.parent;

        while (current) {
          if (
            current.type === 'ForStatement' ||
            current.type === 'ForOfStatement' ||
            current.type === 'ForInStatement' ||
            current.type === 'WhileStatement' ||
            current.type === 'IfStatement' ||
            current.type === 'ConditionalExpression' ||
            isCallbackFunction(current)
          ) {
            context.report({
              node,
              messageId: 'noDynamicUseQuery',
            });
            return;
          }

          current = current.parent;
        }
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./no-dynamic-usequery-in-loops');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'no-dynamic-usequery-in-loops',
  rule,
  {
    valid: ["const result = useQuery({ queryKey: ['user', id] });", "useQueries({ queries: ids.map((id) => ({ queryKey: ['user', id] })) });"],
    invalid: [
      {
        code: "ids.map((id) => useQuery({ queryKey: ['user', id] }));",
        errors: [{ message: /useQueries/ }],
      },
    ],
  }
);
*/
