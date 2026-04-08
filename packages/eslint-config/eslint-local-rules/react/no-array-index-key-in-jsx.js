'use strict';

function pushChildNodes(stack, node) {
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || !value) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item.type === 'string') {
          stack.push(item);
        }
      }
      continue;
    }

    if (typeof value === 'object' && typeof value.type === 'string') {
      stack.push(value);
    }
  }
}

function expressionContainsIdentifier(node, identifierName) {
  if (!node) return false;

  const stack = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.type === 'Identifier' && current.name === identifierName) {
      return true;
    }

    if (
      current !== node &&
      (current.type === 'FunctionExpression' ||
        current.type === 'ArrowFunctionExpression' ||
        current.type === 'FunctionDeclaration')
    ) {
      continue;
    }

    pushChildNodes(stack, current);
  }

  return false;
}

function getMapCallback(node) {
  if (
    node.callee.type !== 'MemberExpression' ||
    node.callee.computed ||
    node.callee.property.type !== 'Identifier' ||
    node.callee.property.name !== 'map'
  ) {
    return null;
  }

  const callback = node.arguments[0];
  if (
    !callback ||
    (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
  ) {
    return null;
  }

  return callback;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'JSX list rendering에서 배열 index를 key로 사용하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noArrayIndexKeyInJsx:
        '리스트 렌더링에서 배열 index를 key로 사용하지 마세요. 안정적인 식별자를 사용하세요.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        const callback = getMapCallback(node);
        if (!callback) return;

        const indexParam = callback.params[1];
        if (!indexParam || indexParam.type !== 'Identifier') {
          return;
        }

        const stack = [callback.body];

        while (stack.length > 0) {
          const current = stack.pop();
          if (!current) continue;

          if (current.type === 'JSXAttribute' && current.name.name === 'key') {
            if (
              current.value?.type === 'JSXExpressionContainer' &&
              expressionContainsIdentifier(current.value.expression, indexParam.name)
            ) {
              context.report({ node: current, messageId: 'noArrayIndexKeyInJsx' });
            }
            continue;
          }

          if (
            current !== callback.body &&
            (current.type === 'FunctionExpression' ||
              current.type === 'ArrowFunctionExpression' ||
              current.type === 'FunctionDeclaration')
          ) {
            continue;
          }

          pushChildNodes(stack, current);
        }
      },
    };
  },
};
