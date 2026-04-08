'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);

  return (
    /\/app\/api\/.*\.(ts|tsx)$/.test(normalized) ||
    /\/app\/.*\/route\.(ts|tsx)$/.test(normalized) ||
    /\/app\/.*\/actions\.(ts|tsx)$/.test(normalized) ||
    /\/pages\/api\/.*\.(ts|tsx)$/.test(normalized)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '서버 파일의 모듈 레벨 mutable 상태를 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noSharedModuleState:
        '서버 파일에서 모듈 레벨 mutable 상태를 사용하지 마세요.\n 동시 요청 간 데이터 오염이 발생합니다.',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    return {
      Program(node) {
        for (const statement of node.body) {
          if (
            statement.type === 'VariableDeclaration' &&
            (statement.kind === 'let' || statement.kind === 'var')
          ) {
            context.report({ node: statement, messageId: 'noSharedModuleState' });
          }
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-shared-module-state');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('no-shared-module-state', rule, {
    valid: [
      {
        code: `export async function GET(req) {
          const currentUser = await getUser(req);
          return currentUser;
        }`,
        filename: '/project/app/api/users/route.ts',
      },
      {
        code: `let currentUser = null;`,
        filename: '/project/src/something.ts',
      },
    ],
    invalid: [
      {
        code: `let currentUser = null;
        export async function GET() {
          return currentUser;
        }`,
        filename: '/project/app/api/users/route.ts',
        errors: [{ messageId: 'noSharedModuleState' }],
      },
      {
        code: `var sessionData = null;`,
        filename: '/project/pages/api/user.ts',
        errors: [{ messageId: 'noSharedModuleState' }],
      },
    ],
  });
*/
