'use strict';

const TARGET_FUNCTIONS = new Set(['useQuery', 'useInfiniteQuery']);

const MESSAGE =
  'queryFn에서 네트워크 요청 시 반드시 signal을 전달하세요.\n' +
  " (예: async ({ signal }) => fetch('/api', { signal }))";

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

function hasSignalParameter(fnNode) {
  const firstParam = fnNode.params[0];
  if (!firstParam || firstParam.type !== 'ObjectPattern') return false;

  return firstParam.properties.some((property) => {
    if (property.type === 'RestElement') return false;

    const value = property.value ?? property.key;
    return value.type === 'Identifier' && value.name === 'signal';
  });
}

function isFetchCall(node) {
  return node.callee.type === 'Identifier' && node.callee.name === 'fetch';
}

function isAxiosCall(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'axios'
  );
}

function optionsArgumentHasSignal(argument) {
  if (!argument) return false;

  if (argument.type === 'Identifier' && argument.name === 'signal') {
    return true;
  }

  if (argument.type !== 'ObjectExpression') {
    return false;
  }

  return argument.properties.some((property) => {
    if (property.type === 'SpreadElement') return false;
    const key = property.key;
    return (
      (key.type === 'Identifier' && key.name === 'signal') ||
      (key.type === 'Literal' && key.value === 'signal')
    );
  });
}

function callHasSignal(node) {
  if (isFetchCall(node)) {
    return optionsArgumentHasSignal(node.arguments[1]);
  }

  if (isAxiosCall(node)) {
    return node.arguments.some(optionsArgumentHasSignal);
  }

  return true;
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

function collectNetworkCalls(fnNode) {
  const body = fnNode.body;
  const stack = [body];
  const networkCalls = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (
      current !== fnNode.body &&
      (current.type === 'FunctionDeclaration' ||
        current.type === 'FunctionExpression' ||
        current.type === 'ArrowFunctionExpression')
    ) {
      continue;
    }

    if (current.type === 'CallExpression' && (isFetchCall(current) || isAxiosCall(current))) {
      networkCalls.push(current);
    }

    pushChildNodes(stack, current);
  }

  return networkCalls;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'queryFn에서 네트워크 요청 시 abort signal 전달을 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      missingAbortSignal: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !TARGET_FUNCTIONS.has(node.callee.name)) return;

        const options = node.arguments[0];
        const queryFnProperty = getObjectProperty(options, 'queryFn');
        if (!queryFnProperty) return;

        const fnNode = queryFnProperty.value;
        if (fnNode.type !== 'ArrowFunctionExpression' && fnNode.type !== 'FunctionExpression') {
          return;
        }

        const networkCalls = collectNetworkCalls(fnNode);
        if (networkCalls.length === 0) return;

        if (!hasSignalParameter(fnNode)) {
          context.report({
            node: fnNode,
            messageId: 'missingAbortSignal',
          });
          return;
        }

        for (const callNode of networkCalls) {
          if (callHasSignal(callNode)) continue;

          context.report({
            node: callNode,
            messageId: 'missingAbortSignal',
          });
        }
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./query-fn-must-use-abort-signal');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'query-fn-must-use-abort-signal',
  rule,
  {
    valid: [
      "useQuery({ queryKey: ['users'], queryFn: async ({ signal }) => fetch('/api/users', { signal }) });",
    ],
    invalid: [
      {
        code: "useQuery({ queryKey: ['users'], queryFn: async () => fetch('/api/users') });",
        errors: [{ message: /signal/ }],
      },
    ],
  }
);
*/
