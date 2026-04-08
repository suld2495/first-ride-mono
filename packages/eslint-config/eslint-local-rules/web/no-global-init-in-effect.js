'use strict';

const INIT_NAME_PATTERN = /^(init|setup|initialize|configure)[A-Z0-9_]/;

function isEmptyDependencies(node) {
  return node?.type === 'ArrayExpression' && node.elements.length === 0;
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

function hasAsyncWork(node) {
  let found = false;
  const stack = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || found) continue;

    if (current.type === 'AwaitExpression') {
      found = true;
      break;
    }

    if (current.type === 'CallExpression') {
      if (
        current.callee.type === 'Identifier' &&
        (current.callee.name === 'fetch' || current.callee.name === 'axios')
      ) {
        found = true;
        break;
      }

      if (
        current.callee.type === 'MemberExpression' &&
        !current.callee.computed &&
        current.callee.property.type === 'Identifier' &&
        ['then', 'catch', 'finally'].includes(current.callee.property.name)
      ) {
        found = true;
        break;
      }
    }

    pushChildNodes(stack, current);
  }

  return found;
}

function isInitCall(node) {
  if (node.callee.type === 'Identifier') {
    return INIT_NAME_PATTERN.test(node.callee.name);
  }

  if (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.property.type === 'Identifier'
  ) {
    return INIT_NAME_PATTERN.test(node.callee.property.name) || node.callee.property.name === 'init';
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '빈 deps useEffect 안에서 전역 초기화 코드를 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noGlobalInitInEffect:
        '빈 deps useEffect 안에서 전역 초기화를 하지 마세요.\n StrictMode에서 두 번 실행됩니다.\n 모듈 레벨에서 초기화하거나 가드 패턴을 사용하세요.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'useEffect') {
          return;
        }

        if (!isEmptyDependencies(node.arguments[1])) {
          return;
        }

        const callback = node.arguments[0];
        if (
          !callback ||
          (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
        ) {
          return;
        }

        if (hasAsyncWork(callback.body)) {
          return;
        }

        const stack = [callback.body];
        while (stack.length > 0) {
          const current = stack.pop();
          if (!current) continue;

          if (current.type === 'CallExpression' && isInitCall(current)) {
            context.report({ node: current, messageId: 'noGlobalInitInEffect' });
          }

          if (
            current !== callback.body &&
            (current.type === 'FunctionDeclaration' ||
              current.type === 'FunctionExpression' ||
              current.type === 'ArrowFunctionExpression')
          ) {
            continue;
          }

          pushChildNodes(stack, current);
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-global-init-in-effect');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('no-global-init-in-effect', rule, {
    valid: [
      `useEffect(() => {
        fetchUser().then(setUser);
      }, []);`,
      `initializeApp();`,
    ],
    invalid: [
      {
        code: `useEffect(() => {
          initializeApp();
        }, []);`,
        errors: [{ messageId: 'noGlobalInitInEffect' }],
      },
      {
        code: `useEffect(() => {
          Analytics.init();
          setupSDK();
        }, []);`,
        errors: [
          { messageId: 'noGlobalInitInEffect' },
          { messageId: 'noGlobalInitInEffect' },
        ],
      },
    ],
  });
*/
