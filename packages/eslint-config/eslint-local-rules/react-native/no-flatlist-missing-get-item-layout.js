'use strict';

const TARGET_COMPONENTS = new Set(['FlashList', 'FlatList']);

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
      description: '고정 높이로 보이는 FlashList/FlatList에는 getItemLayout prop을 강제합니다.',
      recommended: false,
    },
    messages: {
      missingGetItemLayout:
        'FlashList/FlatList에 getItemLayout을 추가하면 스크롤 성능이 향상됩니다. 아이템 높이가 고정이라면 반드시 추가하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (!TARGET_COMPONENTS.has(componentName)) return;

        const hasEstimatedItemSize = hasAttribute(node, 'estimatedItemSize');
        const hasGetItemLayout = hasAttribute(node, 'getItemLayout');

        if (!hasEstimatedItemSize || hasGetItemLayout) return;

        context.report({
          node,
          messageId: 'missingGetItemLayout',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-flatlist-missing-get-item-layout');
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
// tester.run('no-flatlist-missing-get-item-layout', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList estimatedItemSize={100} getItemLayout={(_, index) => ({ length: 100, offset: 100 * index, index })} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList estimatedItemSize={100} renderItem={renderItem} />;',
//       errors: [{ messageId: 'missingGetItemLayout' }],
//     },
//   ],
// });
