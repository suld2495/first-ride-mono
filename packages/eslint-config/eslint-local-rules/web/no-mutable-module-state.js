'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);

  return (
    /\/app\/api\/.*\.(ts|tsx)$/.test(normalized) ||
    /\/app\/.*\/route\.(ts|tsx)$/.test(normalized) ||
    /\/app\/.*\/actions\.(ts|tsx)$/.test(normalized)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '서버 파일의 모듈 최상위 let/var 선언을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noMutableModuleState:
        '서버 파일에서 모듈 레벨 let/var를 사용하지 마세요.\n 요청 간 데이터가 공유되어 보안 문제가 발생합니다.\n 함수 스코프 안에서 선언하세요.',
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
            context.report({ node: statement, messageId: 'noMutableModuleState' });
          }
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-mutable-module-state');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('no-mutable-module-state', rule, {
    valid: [
      {
        code: `const CONFIG = { timeout: 3000 };
        export async function GET() {
          const currentUser = await getUser();
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
          currentUser = await getUser();
        }`,
        filename: '/project/app/api/users/route.ts',
        errors: [{ messageId: 'noMutableModuleState' }],
      },
      {
        code: `var requestData = {};
        export async function POST() {}`,
        filename: '/project/app/admin/route.ts',
        errors: [{ messageId: 'noMutableModuleState' }],
      },
    ],
  });
*/
