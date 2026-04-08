'use strict';

const AUTH_CALL_NAMES = new Set([
  'verifySession',
  'getSession',
  'auth',
  'getUser',
  'checkAuth',
  'requireAuth',
]);

const AUTH_VARIABLE_NAMES = new Set(['session', 'auth']);

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);
  return /\/app\/.*\/actions\.(ts|tsx)$/.test(normalized) || /\/.*\.action\.(ts|tsx)$/.test(normalized);
}

function hasUseServerDirective(programNode) {
  return programNode.body.some(
    (statement) => statement.type === 'ExpressionStatement' && statement.directive === 'use server'
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

function functionHasAuthCheck(node) {
  const stack = [node.body];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (
      current.type === 'CallExpression' &&
      current.callee.type === 'Identifier' &&
      AUTH_CALL_NAMES.has(current.callee.name)
    ) {
      return true;
    }

    if (current.type === 'VariableDeclarator' && current.id.type === 'Identifier') {
      if (AUTH_VARIABLE_NAMES.has(current.id.name)) {
        return true;
      }
    }

    if (
      current !== node.body &&
      (current.type === 'FunctionDeclaration' ||
        current.type === 'FunctionExpression' ||
        current.type === 'ArrowFunctionExpression')
    ) {
      continue;
    }

    pushChildNodes(stack, current);
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '서버 액션 내부의 인증 확인 코드를 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      requireAuthInServerActions:
        '서버 액션에는 반드시 인증 확인 코드가 있어야 합니다.\n 미들웨어는 서버 액션 직접 호출을 막지 못합니다.\n (예: await verifySession())',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    let enabled = false;

    return {
      Program(node) {
        enabled = hasUseServerDirective(node);
      },

      'FunctionDeclaration[async=true]'(node) {
        if (enabled && !functionHasAuthCheck(node)) {
          context.report({ node, messageId: 'requireAuthInServerActions' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./require-auth-in-server-actions');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('require-auth-in-server-actions', rule, {
    valid: [
      {
        code: `'use server';
        async function deletePost(id) {
          await verifySession();
          await db.delete(id);
        }`,
        filename: '/project/app/posts/actions.ts',
      },
    ],
    invalid: [
      {
        code: `'use server';
        async function deletePost(id) {
          await db.delete(id);
        }`,
        filename: '/project/app/posts/actions.ts',
        errors: [{ messageId: 'requireAuthInServerActions' }],
      },
    ],
  });
*/
