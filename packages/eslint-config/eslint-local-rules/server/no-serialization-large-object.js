'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  const normalized = normalizePath(filename);
  return /\/app\/.*\.(ts|tsx)$/.test(normalized) || /\/src\/.*\.(ts|tsx)$/.test(normalized);
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

function collectAwaitVariables(programNode) {
  const awaitVariables = new Set();
  const stack = [programNode];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    if (
      current.type === 'VariableDeclarator' &&
      current.id.type === 'Identifier' &&
      current.init?.type === 'AwaitExpression'
    ) {
      awaitVariables.add(current.id.name);
    }

    pushChildNodes(stack, current);
  }

  return awaitVariables;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'await 결과 객체 전체를 클라이언트 컴포넌트 prop으로 전달하는 패턴을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noSerializationLargeObject:
        '서버에서 받은 객체 전체를 클라이언트 컴포넌트에 전달하지 마세요.\n 필요한 필드만 전달하세요.',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    const awaitVariables = new Set();

    return {
      Program(node) {
        const collected = collectAwaitVariables(node);
        collected.forEach((name) => awaitVariables.add(name));
      },

      JSXAttribute(node) {
        if (
          node.value?.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'Identifier' &&
          awaitVariables.has(node.value.expression.name)
        ) {
          context.report({ node, messageId: 'noSerializationLargeObject' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./no-serialization-large-object');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('no-serialization-large-object', rule, {
    valid: [
      {
        code: `const user = await getUser();
        return <ClientComponent userId={user.id} userName={user.name} />;`,
        filename: '/project/app/users/page.tsx',
      },
    ],
    invalid: [
      {
        code: `const user = await getUser();
        return <ClientComponent user={user} />;`,
        filename: '/project/app/users/page.tsx',
        errors: [{ messageId: 'noSerializationLargeObject' }],
      },
    ],
  });
*/
