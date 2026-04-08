'use strict';

function getMemoCallback(node) {
  if (node.callee.type === 'Identifier' && node.callee.name === 'memo') {
    return node.arguments[0] || null;
  }

  if (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'React' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'memo'
  ) {
    return node.arguments[0] || null;
  }

  return null;
}

function inspectPattern(pattern, callback) {
  if (!pattern) return;

  switch (pattern.type) {
    case 'AssignmentPattern':
      callback(pattern);
      inspectPattern(pattern.left, callback);
      break;
    case 'ObjectPattern':
      pattern.properties.forEach((property) => {
        if (property.type === 'Property') {
          inspectPattern(property.value, callback);
        } else if (property.type === 'RestElement') {
          inspectPattern(property.argument, callback);
        }
      });
      break;
    case 'ArrayPattern':
      pattern.elements.forEach((element) => inspectPattern(element, callback));
      break;
    case 'RestElement':
      inspectPattern(pattern.argument, callback);
      break;
    default:
      break;
  }
}

function isInlineReferenceValue(node) {
  return (
    node?.type === 'ArrowFunctionExpression' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ObjectExpression' ||
    node?.type === 'ArrayExpression'
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'React.memo 컴포넌트 파라미터에 인라인 참조형 기본값 사용을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noInlineDefaultInMemo:
        'React.memo 컴포넌트의 파라미터에 인라인 함수/객체/배열 기본값을 사용하지 마세요.\n 렌더마다 새 참조가 생성되어 memo가 무의미해집니다.\n 모듈 레벨 상수로 분리하세요. (예: const NOOP = () => {})',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const callback = getMemoCallback(node);
        if (
          !callback ||
          (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
        ) {
          return;
        }

        callback.params.forEach((param) => {
          inspectPattern(param, (assignmentPattern) => {
            if (isInlineReferenceValue(assignmentPattern.right)) {
              context.report({
                node: assignmentPattern.right,
                messageId: 'noInlineDefaultInMemo',
              });
            }
          });
        });
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-inline-default-in-memo');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('no-inline-default-in-memo', rule, {
    valid: [
      `const NOOP = () => {};
      const Avatar = React.memo(function({ onClick = NOOP }) { return <View />; });`,
      `const Card = memo(({ size = 'md' }) => <View>{size}</View>);`,
    ],
    invalid: [
      {
        code: `const Avatar = React.memo(function({ onClick = () => {} }) { return <View />; });`,
        errors: [{ messageId: 'noInlineDefaultInMemo' }],
      },
      {
        code: `const List = memo(({ items = [], style = {} }) => <View />);`,
        errors: [
          { messageId: 'noInlineDefaultInMemo' },
          { messageId: 'noInlineDefaultInMemo' },
        ],
      },
    ],
  });
*/
