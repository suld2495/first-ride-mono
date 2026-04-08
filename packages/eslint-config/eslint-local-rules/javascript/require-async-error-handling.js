'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'async 함수에서 await 사용 시 try-catch 또는 .catch()로 에러를 처리하세요.',
      recommended: false,
    },
    messages: {
      missingErrorHandling: '비동기 호출은 반드시 try-catch 또는 .catch()로 에러를 처리하세요.',
    },
    schema: [],
  },

  create(context) {
    /**
     * 현재 노드가 TryStatement의 try 블록 안에 있는지 확인.
     * 함수 경계를 넘어서지 않음.
     */
    function isInsideTryBlock(node) {
      let current = node.parent;
      while (current) {
        if (
          current.type === 'BlockStatement' &&
          current.parent &&
          current.parent.type === 'TryStatement' &&
          current.parent.block === current
        ) {
          return true;
        }
        // 함수 경계에서 중단
        if (
          current.type === 'FunctionDeclaration' ||
          current.type === 'FunctionExpression' ||
          current.type === 'ArrowFunctionExpression'
        ) {
          break;
        }
        current = current.parent;
      }
      return false;
    }

    /**
     * .then() 호출 체인에 .catch()가 있는지 확인.
     */
    function hasCatchInChain(node) {
      let current = node;
      while (current) {
        const parent = current.parent;
        if (!parent) break;

        if (
          parent.type === 'MemberExpression' &&
          parent.object === current &&
          !parent.computed &&
          parent.property.name === 'catch'
        ) {
          return true;
        }

        // 체인 위로 이동 (MemberExpression 또는 CallExpression)
        if (
          (parent.type === 'MemberExpression' && parent.object === current) ||
          (parent.type === 'CallExpression' && parent.callee === current)
        ) {
          current = parent;
        } else {
          break;
        }
      }
      return false;
    }

    return {
      AwaitExpression(node) {
        if (!isInsideTryBlock(node)) {
          context.report({ node, messageId: 'missingErrorHandling' });
        }
      },

      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.name !== 'then'
        ) {
          return;
        }

        // await foo.then(...) 는 AwaitExpression 규칙으로 처리
        if (node.parent && node.parent.type === 'AwaitExpression') {
          return;
        }

        if (!hasCatchInChain(node)) {
          context.report({ node, messageId: 'missingErrorHandling' });
        }
      },
    };
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ───────────────────────────────────────────

  const { RuleTester } = require('eslint');
  const rule = require('./require-async-error-handling');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  });

  tester.run('require-async-error-handling', rule, {
    valid: [
      // try-catch 사용
      `async function fetchData() {
        try {
          const data = await fetchUser();
        } catch (error) {
          console.error(error);
        }
      }`,

      // .catch() 사용
      `fetchUser()
        .then(data => setUser(data))
        .catch(error => console.error(error));`,

      // await + try-catch 중첩
      `async function load() {
        try {
          const a = await getA();
          const b = await getB();
        } catch (e) {
          console.error(e);
        }
      }`,
    ],

    invalid: [
      // try-catch 없는 await
      {
        code: `async function fetchData() {
          const data = await fetchUser();
        }`,
        errors: [{ messageId: 'missingErrorHandling' }],
      },

      // .catch() 없는 .then()
      {
        code: `fetchUser().then(data => setUser(data));`,
        errors: [{ messageId: 'missingErrorHandling' }],
      },

      // 중첩된 async 함수에서 try-catch 없는 await
      {
        code: `function outer() {
          async function inner() {
            const data = await fetchUser();
          }
        }`,
        errors: [{ messageId: 'missingErrorHandling' }],
      },
    ],
  });
*/
