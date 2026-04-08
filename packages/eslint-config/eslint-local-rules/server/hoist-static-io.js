'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);

  return /\/app\/api\/.*\.(ts|tsx)$/.test(normalized) || /\/app\/.*\/route\.(ts|tsx)$/.test(normalized);
}

function isFsReadCall(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'fs' &&
    node.callee.property.type === 'Identifier' &&
    ['readFileSync', 'readFile'].includes(node.callee.property.name)
  );
}

function isJsonParseFsRead(node) {
  return (
    node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'JSON' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 'parse' &&
    isFsReadCall(node.arguments[0])
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '정적 파일 읽기를 매 요청마다 함수 안에서 수행하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      hoistStaticIo:
        '정적 파일 읽기는 모듈 레벨에서 한 번만 하세요.\n 매 요청마다 읽으면 불필요한 I/O 비용이 발생합니다.',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    let functionDepth = 0;

    function enterFunction() {
      functionDepth += 1;
    }

    function exitFunction() {
      functionDepth -= 1;
    }

    return {
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      CallExpression(node) {
        if (functionDepth === 0) {
          return;
        }

        if (isFsReadCall(node) || isJsonParseFsRead(node)) {
          context.report({ node, messageId: 'hoistStaticIo' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./hoist-static-io');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('hoist-static-io', rule, {
    valid: [
      {
        code: `const config = fs.readFileSync('./config.json');
        export async function GET() {
          return config;
        }`,
        filename: '/project/app/api/users/route.ts',
      },
    ],
    invalid: [
      {
        code: `export async function GET() {
          const config = fs.readFileSync('./config.json');
          return config;
        }`,
        filename: '/project/app/api/users/route.ts',
        errors: [{ messageId: 'hoistStaticIo' }],
      },
      {
        code: `export async function GET() {
          const config = JSON.parse(fs.readFileSync('./config.json'));
          return config;
        }`,
        filename: '/project/app/users/route.ts',
        errors: [
          { messageId: 'hoistStaticIo' },
          { messageId: 'hoistStaticIo' },
        ],
      },
    ],
  });
*/
