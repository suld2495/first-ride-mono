'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function getJSXTagName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') return nameNode.property.name;
  return null;
}

function hasAttribute(node, attributeName) {
  return node.attributes.some(
    (attribute) =>
      attribute.type === 'JSXAttribute' &&
      attribute.name.type === 'JSXIdentifier' &&
      attribute.name.name === attributeName,
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'TextInput에서 value와 defaultValue를 동시에 사용하는 것을 금지합니다.',
      recommended: false,
    },
    messages: {
      noMixedValueMode:
        'TextInput에서 value와 defaultValue를 동시에 사용하지 마세요. controlled(value+onChangeText) 또는 uncontrolled(defaultValue) 중 하나만 사용하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (componentName !== 'TextInput') return;

        if (!hasAttribute(node, 'value') || !hasAttribute(node, 'defaultValue')) return;

        context.report({
          node,
          messageId: 'noMixedValueMode',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-textinput-value-defaultvalue');
//
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: tsParser,
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
//
// tester.run('no-textinput-value-defaultvalue', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: '<TextInput value={value} onChangeText={setValue} />;',
//     },
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: '<TextInput defaultValue="init" />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/form/input.tsx',
//       code: '<TextInput value={value} defaultValue="init" onChangeText={setValue} />;',
//       errors: [{ messageId: 'noMixedValueMode' }],
//     },
//   ],
// });
