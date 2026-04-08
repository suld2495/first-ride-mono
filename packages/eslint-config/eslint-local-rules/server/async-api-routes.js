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

function getDeclaredNames(node) {
  const names = new Set();

  function visit(pattern) {
    if (!pattern) return;

    switch (pattern.type) {
      case 'Identifier':
        names.add(pattern.name);
        break;
      case 'AssignmentPattern':
        visit(pattern.left);
        break;
      case 'RestElement':
        visit(pattern.argument);
        break;
      case 'ArrayPattern':
        pattern.elements.forEach(visit);
        break;
      case 'ObjectPattern':
        pattern.properties.forEach((property) => {
          if (property.type === 'Property') {
            visit(property.value);
          } else if (property.type === 'RestElement') {
            visit(property.argument);
          }
        });
        break;
      default:
        break;
    }
  }

  node.declarations.forEach((declaration) => visit(declaration.id));
  return names;
}

function getAwaitedExpression(statement) {
  if (statement.type !== 'VariableDeclaration' || statement.declarations.length !== 1) {
    return null;
  }

  const init = statement.declarations[0].init;
  return init?.type === 'AwaitExpression' ? init.argument : null;
}

function containsAnyIdentifier(node, names) {
  let found = false;

  function visit(current) {
    if (!current || found) return;

    if (current.type === 'Identifier' && names.has(current.name)) {
      found = true;
      return;
    }

    for (const key of Object.keys(current)) {
      if (key === 'parent') continue;
      const value = current[key];
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (value && typeof value.type === 'string') {
        visit(value);
      }
    }
  }

  visit(node);
  return found;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '서버 핸들러의 독립적인 async waterfall을 금지합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      asyncApiRoutes:
        '서버 핸들러에서 독립적인 async 작업은 Promise.all로 병렬 처리하세요.\n 순차 실행은 응답 시간을 늘립니다.',
    },
  },

  create(context) {
    const filename = typeof context.filename === 'string' ? context.filename : context.getFilename();
    if (!filename || filename === '<input>' || !isTargetFile(filename)) {
      return {};
    }

    function inspectBody(body) {
      for (let index = 0; index < body.length - 1; index += 1) {
        const current = body[index];
        const next = body[index + 1];

        const currentAwaited = getAwaitedExpression(current);
        const nextAwaited = getAwaitedExpression(next);
        if (!currentAwaited || !nextAwaited) {
          continue;
        }

        const currentNames = getDeclaredNames(current);
        if (currentNames.size === 0) {
          continue;
        }

        if (!containsAnyIdentifier(nextAwaited, currentNames)) {
          context.report({ node: next, messageId: 'asyncApiRoutes' });
        }
      }
    }

    return {
      'FunctionDeclaration[async=true] > BlockStatement'(node) {
        inspectBody(node.body);
      },
      'FunctionExpression[async=true] > BlockStatement'(node) {
        inspectBody(node.body);
      },
      'ArrowFunctionExpression[async=true] > BlockStatement'(node) {
        inspectBody(node.body);
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./async-api-routes');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('async-api-routes', rule, {
    valid: [
      {
        code: `async function GET(id) {
          const user = await getUser(id);
          const profile = await getProfile(user.profileId);
        }`,
        filename: '/project/app/api/users/route.ts',
      },
    ],
    invalid: [
      {
        code: `async function GET(id) {
          const user = await getUser(id);
          const posts = await getPosts(id);
        }`,
        filename: '/project/app/api/users/route.ts',
        errors: [{ messageId: 'asyncApiRoutes' }],
      },
    ],
  });
*/
