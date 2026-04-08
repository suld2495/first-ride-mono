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

function getAttribute(node, attributeName) {
  return (
    node.attributes.find(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        attribute.name.type === 'JSXIdentifier' &&
        attribute.name.name === attributeName,
    ) ?? null
  );
}

function getAttributeExpression(attribute) {
  if (!attribute || !attribute.value || attribute.value.type !== 'JSXExpressionContainer') {
    return null;
  }

  return attribute.value.expression;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'FlashList/FlatList의 renderItem에 인라인 함수를 직접 전달하는 것을 금지합니다.',
      recommended: false,
    },
    messages: {
      noInlineRenderItem:
        'FlashList/FlatList의 renderItem에 인라인 함수를 사용하지 마세요. useCallback으로 감싼 외부 함수를 전달하세요.',
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

        const renderItemAttribute = getAttribute(node, 'renderItem');
        const renderItemExpression = getAttributeExpression(renderItemAttribute);

        if (
          renderItemExpression?.type === 'ArrowFunctionExpression' ||
          renderItemExpression?.type === 'FunctionExpression'
        ) {
          context.report({
            node: renderItemAttribute,
            messageId: 'noInlineRenderItem',
          });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-inline-render-item');
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
// tester.run('no-inline-render-item', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: 'const renderItem = useCallback(({ item }) => <Item item={item} />, []); <FlashList renderItem={renderItem} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList renderItem={({ item }) => <Item item={item} />} />;',
//       errors: [{ messageId: 'noInlineRenderItem' }],
//     },
//   ],
// });
