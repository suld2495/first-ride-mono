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
    /\/features\/.*\/api\/.*\.(ts|tsx)$/.test(normalized) ||
    /\/services\/.*\.(ts|tsx)$/.test(normalized)
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

function functionHasAwait(node) {
  const stack = [node.body];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (current.type === 'AwaitExpression') {
      return true;
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

function isReduceCallback(node) {
  return (
    node.parent?.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression' &&
    !node.parent.callee.computed &&
    node.parent.callee.property.type === 'Identifier' &&
    node.parent.callee.property.name === 'reduce' &&
    node.parent.arguments[0] === node
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '루프 안의 await와 reduce 콜백 안의 await를 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noParallelNestedFetching:
        '루프 안에서 await를 사용하지 마세요. N번 순차 fetch가 발생합니다.\n Promise.all로 병렬 처리하세요.\n (예: await Promise.all(ids.map(id => getUser(id))))',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    return {
      ForStatement(node) {
        if (functionHasAwait({ body: node.body })) {
          context.report({ node, messageId: 'noParallelNestedFetching' });
        }
      },
      ForOfStatement(node) {
        if (functionHasAwait({ body: node.body })) {
          context.report({ node, messageId: 'noParallelNestedFetching' });
        }
      },
      ForInStatement(node) {
        if (functionHasAwait({ body: node.body })) {
          context.report({ node, messageId: 'noParallelNestedFetching' });
        }
      },
      ArrowFunctionExpression(node) {
        if (isReduceCallback(node) && functionHasAwait(node)) {
          context.report({ node, messageId: 'noParallelNestedFetching' });
        }
      },
      FunctionExpression(node) {
        if (isReduceCallback(node) && functionHasAwait(node)) {
          context.report({ node, messageId: 'noParallelNestedFetching' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-parallel-nested-fetching');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('no-parallel-nested-fetching', rule, {
    valid: [
      {
        code: `const users = await Promise.all(ids.map(id => getUser(id)));`,
        filename: '/project/src/services/user.ts',
      },
    ],
    invalid: [
      {
        code: `for (const id of ids) {
          const user = await getUser(id);
          results.push(user);
        }`,
        filename: '/project/src/services/user.ts',
        errors: [{ messageId: 'noParallelNestedFetching' }],
      },
      {
        code: `const users = await items.reduce(async (acc, item) => {
          const prev = await acc;
          const user = await getUser(item.id);
          return [...prev, user];
        }, Promise.resolve([]));`,
        filename: '/project/app/api/users/route.ts',
        errors: [{ messageId: 'noParallelNestedFetching' }],
      },
    ],
  });
*/
