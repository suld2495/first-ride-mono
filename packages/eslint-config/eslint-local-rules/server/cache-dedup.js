'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);

  return (
    /\/app\/.*\.(ts|tsx)$/.test(normalized) ||
    /\/features\/.*\/api\/.*\.(ts|tsx)$/.test(normalized) ||
    /\/services\/.*\.(ts|tsx)$/.test(normalized)
  );
}

function serializeArgument(node) {
  if (!node) return 'undefined';

  switch (node.type) {
    case 'Literal':
      return JSON.stringify(node.value);
    case 'Identifier':
      return `id:${node.name}`;
    case 'MemberExpression':
      return `${serializeArgument(node.object)}.${serializeArgument(node.property)}`;
    case 'TemplateLiteral':
      return node.quasis.map((quasi) => quasi.value.raw).join('${}');
    default:
      return node.type;
  }
}

function getAwaitedCallKey(node) {
  if (
    node.type !== 'AwaitExpression' ||
    node.argument.type !== 'CallExpression' ||
    node.argument.callee.type !== 'Identifier'
  ) {
    return null;
  }

  const argsKey = node.argument.arguments.map(serializeArgument).join('|');
  return `${node.argument.callee.name}(${argsKey})`;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '같은 함수를 같은 인자로 중복 await 호출하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      cacheDedup:
        '같은 함수를 같은 인자로 중복 호출하지 마세요.\n React cache()로 dedupe하세요.\n (예: const getCachedUser = cache(getUser))',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    const seenCalls = new Map();

    return {
      AwaitExpression(node) {
        const key = getAwaitedCallKey(node);
        if (!key) {
          return;
        }

        if (seenCalls.has(key)) {
          context.report({ node, messageId: 'cacheDedup' });
          return;
        }

        seenCalls.set(key, node);
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./cache-dedup');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('cache-dedup', rule, {
    valid: [
      {
        code: `const user = await getCachedUser(id);
        const post = await getPost(id);`,
        filename: '/project/src/services/user.ts',
      },
    ],
    invalid: [
      {
        code: `const user1 = await getUser(id);
        const user2 = await getUser(id);`,
        filename: '/project/app/users/page.tsx',
        errors: [{ messageId: 'cacheDedup' }],
      },
    ],
  });
*/
