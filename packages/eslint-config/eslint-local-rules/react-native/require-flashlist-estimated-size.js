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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'FlashList에는 반드시 estimatedItemSize prop을 명시하도록 강제합니다.',
      recommended: false,
    },
    messages: {
      missingEstimatedItemSize:
        'FlashList에는 반드시 estimatedItemSize prop을 명시하세요. 성능 최적화의 핵심 prop입니다. (예: estimatedItemSize={100})',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (componentName !== 'FlashList') return;

        const hasEstimatedItemSize = node.attributes.some(
          (attribute) =>
            attribute.type === 'JSXAttribute' &&
            attribute.name.type === 'JSXIdentifier' &&
            attribute.name.name === 'estimatedItemSize',
        );

        if (hasEstimatedItemSize) return;

        context.report({
          node,
          messageId: 'missingEstimatedItemSize',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./require-flashlist-estimated-size');
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
// tester.run('require-flashlist-estimated-size', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/feed/list.tsx',
//       code: '<FlashList data={items} renderItem={renderItem} estimatedItemSize={100} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/feed/list.tsx',
//       code: '<FlashList data={items} renderItem={renderItem} />;',
//       errors: [{ messageId: 'missingEstimatedItemSize' }],
//     },
//   ],
// });
