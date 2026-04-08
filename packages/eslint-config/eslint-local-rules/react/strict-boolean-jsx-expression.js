'use strict';

function isAllowedBooleanExpression(node) {
  if (!node) return false;

  if (node.type === 'BinaryExpression') {
    return true;
  }

  if (node.type === 'UnaryExpression' && node.operator === '!') {
    return true;
  }

  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'Boolean'
  ) {
    return true;
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'JSX에서 && 조건 렌더 대신 명시적 boolean 표현을 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      strictBooleanJsx:
        'JSX에서 && 조건 렌더를 사용하지 마세요.\n 0, \'\' 같은 falsy 값이 렌더링될 수 있습니다.\n 삼항 연산자를 사용하세요. (예: {count > 0 ? <X /> : null})',
    },
  },

  create(context) {
    return {
      JSXExpressionContainer(node) {
        const expression = node.expression;
        if (
          expression?.type !== 'LogicalExpression' ||
          expression.operator !== '&&' ||
          isAllowedBooleanExpression(expression.left)
        ) {
          return;
        }

        if (
          expression.left.type === 'Identifier' ||
          expression.left.type === 'MemberExpression'
        ) {
          context.report({ node: expression, messageId: 'strictBooleanJsx' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./strict-boolean-jsx-expression');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('strict-boolean-jsx-expression', rule, {
    valid: [
      `{count > 0 ? <Text>{count}</Text> : null}`,
      `{!!user && <Profile user={user} />}`,
      `{Boolean(user) && <Profile user={user} />}`,
    ],
    invalid: [
      {
        code: `const C = () => <>{count && <Text>{count}</Text>}</>;`,
        errors: [{ messageId: 'strictBooleanJsx' }],
      },
      {
        code: `const C = () => <>{items.length && <List items={items} />}</>;`,
        errors: [{ messageId: 'strictBooleanJsx' }],
      },
    ],
  });
*/
