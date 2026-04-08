'use strict';

function isAwaitStatement(statement) {
  if (!statement) return false;

  if (statement.type === 'VariableDeclaration') {
    return statement.declarations.some(
      (declaration) => declaration.init?.type === 'AwaitExpression'
    );
  }

  if (statement.type === 'ExpressionStatement') {
    return statement.expression.type === 'AwaitExpression';
  }

  return false;
}

function isEarlyExitIf(statement) {
  return (
    statement?.type === 'IfStatement' &&
    !statement.alternate &&
    statement.consequent?.type === 'ReturnStatement'
  );
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '필요 없는 await를 조건 검사보다 먼저 수행하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      asyncDeferAwait:
        '비싼 async 호출 전에 조건 검사를 먼저 하세요.\n 불필요한 API 호출을 막을 수 있습니다.',
    },
  },

  create(context) {
    function inspectBody(body) {
      for (let index = 0; index < body.length - 1; index += 1) {
        const current = body[index];
        const next = body[index + 1];

        if (isAwaitStatement(current) && isEarlyExitIf(next)) {
          context.report({ node: current, messageId: 'asyncDeferAwait' });
        }
      }
    }

    return {
      'FunctionDeclaration[async=true] > BlockStatement'(node) {
        inspectBody(node.body);
      },
      'FunctionExpression[async=true] > BlockStatement'(node) {
        inspectBody(node.body);
      },
      'ArrowFunctionExpression[async=true] > BlockStatement'(node) {
        inspectBody(node.body);
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./async-defer-await');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('async-defer-await', rule, {
    valid: [
      `async function handleSubmit(data) {
        if (!data.isValid) return;
        const result = await expensiveApiCall(data);
        return result;
      }`,
    ],
    invalid: [
      {
        code: `async function handleSubmit(data) {
          const result = await expensiveApiCall(data);
          if (!data.isValid) return;
          return result;
        }`,
        errors: [{ messageId: 'asyncDeferAwait' }],
      },
    ],
  });
*/
