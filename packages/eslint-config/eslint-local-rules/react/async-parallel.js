'use strict';

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
      description: '독립적인 async 작업의 순차 await를 금지하고 Promise.all을 유도합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      asyncParallel:
        '독립적인 async 작업은 Promise.all로 병렬 처리하세요.\n 순차 실행은 불필요한 대기 시간을 만듭니다.\n (예: const [a, b] = await Promise.all([getA(), getB()]))',
    },
  },

  create(context) {
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
          context.report({ node: next, messageId: 'asyncParallel' });
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
  const rule = require('./async-parallel');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('async-parallel', rule, {
    valid: [
      `async function load(id) {
        const user = await getUser(id);
        const profile = await getProfile(user.profileId);
      }`,
      `async function load(id) {
        const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
      }`,
    ],
    invalid: [
      {
        code: `async function load(id) {
          const user = await getUser(id);
          const posts = await getPosts(id);
        }`,
        errors: [{ messageId: 'asyncParallel' }],
      },
      {
        code: `async function load(id) {
          const user = await getUser(id);
          const posts = await getPosts(id);
          const comments = await getComments();
        }`,
        errors: [
          { messageId: 'asyncParallel' },
          { messageId: 'asyncParallel' },
        ],
      },
    ],
  });
*/
