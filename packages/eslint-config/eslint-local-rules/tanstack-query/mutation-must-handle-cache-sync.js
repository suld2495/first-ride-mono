'use strict';

const CACHE_SYNC_METHODS = new Set([
  'invalidateQueries',
  'setQueryData',
  'refetchQueries',
  'removeQueries',
]);

const CALLBACK_NAMES = new Set(['onSuccess', 'onSettled', 'onMutate']);

const MESSAGE =
  'useMutation 후 반드시 캐시를 동기화하세요.\n' +
  ' onSuccess 또는 onSettled 에서 invalidateQueries 또는 setQueryData를 호출하세요.';

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

function callbackHasCacheSync(fnNode) {
  const stack = [fnNode.body];

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

    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'MemberExpression' &&
      !current.callee.computed &&
      current.callee.property.type === 'Identifier' &&
      CACHE_SYNC_METHODS.has(current.callee.property.name)
    ) {
      return true;
    }

    pushChildNodes(stack, current);
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'useMutation 이후 캐시 동기화 처리를 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      missingCacheSync: MESSAGE,
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useMutation') return;

        const options = node.arguments[0];
        if (!options || options.type !== 'ObjectExpression') return;

        const hasCacheSync = options.properties.some((property) => {
          if (
            property.type !== 'Property' ||
            property.computed ||
            !(
              (property.key.type === 'Identifier' && CALLBACK_NAMES.has(property.key.name)) ||
              (property.key.type === 'Literal' && CALLBACK_NAMES.has(String(property.key.value)))
            )
          ) {
            return false;
          }

          const callbackNode = property.value;
          if (
            callbackNode.type !== 'ArrowFunctionExpression' &&
            callbackNode.type !== 'FunctionExpression'
          ) {
            return false;
          }

          return callbackHasCacheSync(callbackNode);
        });

        if (hasCacheSync) return;

        context.report({
          node,
          messageId: 'missingCacheSync',
        });
      },
    };
  },
};

/*
RuleTester example:
const { RuleTester } = require('eslint');
const rule = require('./mutation-must-handle-cache-sync');

new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } }).run(
  'mutation-must-handle-cache-sync',
  rule,
  {
    valid: [
      "useMutation({ mutationFn: updateUser, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); } });",
    ],
    invalid: [
      {
        code: "useMutation({ mutationFn: deleteUser, onError: handleError });",
        errors: [{ message: /캐시를 동기화/ }],
      },
    ],
  }
);
*/
