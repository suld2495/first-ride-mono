'use strict';

const TARGET_FUNCTIONS = new Set(['useQuery', 'useInfiniteQuery']);
const OPTIONAL_IDENTIFIER_PATTERN = /(id|slug|token|code|key)$/i;

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

function collectIdentifierNames(node) {
  if (!node) return new Set();

  const names = new Set();
  const stack = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.type === 'Identifier') {
      names.add(current.name);
      continue;
    }

    if (
      current !== node &&
      (current.type === 'FunctionDeclaration' ||
        current.type === 'FunctionExpression' ||
        current.type === 'ArrowFunctionExpression')
    ) {
      continue;
    }

    pushChildNodes(stack, current);
  }

  return names;
}

function getQueryKeyIdentifiers(queryKeyNode) {
  if (!queryKeyNode) {
    return [];
  }

  if (queryKeyNode.type === 'ArrayExpression') {
    return queryKeyNode.elements.filter(
      (element) =>
        element?.type === 'Identifier' && OPTIONAL_IDENTIFIER_PATTERN.test(element.name),
    );
  }

  if (queryKeyNode.type === 'CallExpression') {
    return queryKeyNode.arguments.filter(
      (argument) =>
        argument?.type === 'Identifier' && OPTIONAL_IDENTIFIER_PATTERN.test(argument.name),
    );
  }

  return [];
}

function functionBodyHasGuardForName(functionNode, identifierName) {
  if (functionNode.body.type !== 'BlockStatement') {
    return false;
  }

  const firstStatement = functionNode.body.body[0];
  if (!firstStatement || firstStatement.type !== 'IfStatement') {
    return false;
  }

  const test = firstStatement.test;
  if (
    test.type === 'UnaryExpression' &&
    test.operator === '!' &&
    test.argument.type === 'Identifier' &&
    test.argument.name === identifierName
  ) {
    return true;
  }

  if (
    test.type === 'BinaryExpression' &&
    ['==', '==='].includes(test.operator) &&
    test.left.type === 'Identifier' &&
    test.left.name === identifierName &&
    test.right.type === 'Literal' &&
    test.right.value == null
  ) {
    return true;
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '조건부 파라미터를 사용하는 TanStack Query에는 enabled 가드를 함께 선언하도록 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      requireEnabledOnConditionalQuery:
        '조건부 파라미터가 queryFn에 사용될 때는 enabled 옵션으로 실행 조건을 명시하세요.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !TARGET_FUNCTIONS.has(node.callee.name)) {
          return;
        }

        const optionsNode = node.arguments[0];
        const enabledProperty = getObjectProperty(optionsNode, 'enabled');
        if (enabledProperty) {
          return;
        }

        const queryKeyProperty = getObjectProperty(optionsNode, 'queryKey');
        const queryFnProperty = getObjectProperty(optionsNode, 'queryFn');
        if (!queryKeyProperty || !queryFnProperty) {
          return;
        }

        const queryFnNode = queryFnProperty.value;
        if (
          queryFnNode.type !== 'ArrowFunctionExpression' &&
          queryFnNode.type !== 'FunctionExpression'
        ) {
          return;
        }

        const riskyIdentifiers = getQueryKeyIdentifiers(queryKeyProperty.value);
        if (riskyIdentifiers.length === 0) {
          return;
        }

        const queryFnIdentifiers = collectIdentifierNames(queryFnNode.body);

        const shouldRequireEnabled = riskyIdentifiers.some((identifierNode) => {
          if (!queryFnIdentifiers.has(identifierNode.name)) {
            return false;
          }

          return !functionBodyHasGuardForName(queryFnNode, identifierNode.name);
        });

        if (shouldRequireEnabled) {
          context.report({ node, messageId: 'requireEnabledOnConditionalQuery' });
        }
      },
    };
  },
};
