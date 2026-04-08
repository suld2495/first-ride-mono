'use strict';

const REQUIRED_PROPS = ['removeClippedSubviews', 'maxToRenderPerBatch', 'windowSize'];
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
      description: 'FlashList/FlatList 사용 시 핵심 성능 prop 누락을 금지합니다.',
      recommended: false,
    },
    messages: {
      missingPerfProps:
        'FlashList/FlatList에 성능 prop이 누락되었습니다. 누락된 prop: {{missingProps}} (removeClippedSubviews, maxToRenderPerBatch, windowSize)',
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

        const missingProps = REQUIRED_PROPS.filter((propName) => !hasAttribute(node, propName));

        if (missingProps.length === 0) return;

        context.report({
          node,
          messageId: 'missingPerfProps',
          data: {
            missingProps: missingProps.join(', '),
          },
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-flatlist-missing-perf-props');
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
// tester.run('no-flatlist-missing-perf-props', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList removeClippedSubviews={true} maxToRenderPerBatch={10} windowSize={5} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList renderItem={renderItem} />;',
//       errors: [{ messageId: 'missingPerfProps' }],
//     },
//   ],
// });
