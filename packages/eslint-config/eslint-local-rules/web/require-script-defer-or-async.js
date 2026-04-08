'use strict';

function getAttribute(node, name) {
  return (
    node.attributes.find(
      (attribute) =>
        attribute?.type === 'JSXAttribute' &&
        attribute.name?.type === 'JSXIdentifier' &&
        attribute.name.name === name
    ) || null
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '<script> 태그에 defer 또는 async 속성을 강제합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      requireScriptDeferOrAsync:
        '<script> 태그에 defer 또는 async 속성을 추가하세요.\n 없으면 HTML 렌더링이 차단됩니다.',
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'script') {
          return;
        }

        const srcAttribute = getAttribute(node, 'src');
        if (!srcAttribute) {
          return;
        }

        const hasDefer = Boolean(getAttribute(node, 'defer'));
        const hasAsync = Boolean(getAttribute(node, 'async'));

        if (!hasDefer && !hasAsync) {
          context.report({ node, messageId: 'requireScriptDeferOrAsync' });
        }
      },
    };
  },
};

/*
  const { RuleTester } = require('eslint');
  const rule = require('./require-script-defer-or-async');

  const tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });

  tester.run('require-script-defer-or-async', rule, {
    valid: [
      `const App = () => <script src="analytics.js" defer />;`,
      `const App = () => <script src="app.js" async />;`,
      `const App = () => <script>{\`inline\`}</script>;`,
    ],
    invalid: [
      {
        code: `const App = () => <script src="analytics.js" />;`,
        errors: [{ messageId: 'requireScriptDeferOrAsync' }],
      },
      {
        code: `const App = () => <script src="app.js"></script>;`,
        errors: [{ messageId: 'requireScriptDeferOrAsync' }],
      },
    ],
  });
*/
