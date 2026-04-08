'use strict';

const DISALLOWED_COMPONENTS = new Set(['FlatList', 'SectionList']);

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
      description: 'FlatList/SectionList 대신 @shopify/flash-list 의 FlashList 사용을 강제합니다.',
      recommended: false,
    },
    messages: {
      useFlashList:
        'FlatList/SectionList 대신 @shopify/flash-list 의 FlashList를 사용하세요. FlashList는 FlatList 대비 성능이 월등히 뛰어납니다.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native') return;

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            DISALLOWED_COMPONENTS.has(specifier.imported.name)
          ) {
            context.report({
              node: specifier,
              messageId: 'useFlashList',
            });
          }
        }
      },

      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (!componentName || !DISALLOWED_COMPONENTS.has(componentName)) return;

        context.report({
          node,
          messageId: 'useFlashList',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-flatlist-use-flashlist');
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
// tester.run('no-flatlist-use-flashlist', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/feed/list.tsx',
//       code: "import { FlashList } from '@shopify/flash-list'; <FlashList data={items} />;",
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/feed/list.tsx',
//       code: "import { FlatList } from 'react-native';",
//       errors: [{ messageId: 'useFlashList' }],
//     },
//     {
//       filename: '/project/src/features/feed/list.tsx',
//       code: '<SectionList sections={sections} />;',
//       errors: [{ messageId: 'useFlashList' }],
//     },
//   ],
// });
