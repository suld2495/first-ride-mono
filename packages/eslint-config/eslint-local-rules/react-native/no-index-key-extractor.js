'use strict';

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function getAttributeExpression(attribute) {
  if (!attribute || !attribute.value || attribute.value.type !== 'JSXExpressionContainer') {
    return null;
  }

  return attribute.value.expression;
}

function findKeyExtractorAttribute(node) {
  return (
    node.attributes.find(
      (attribute) =>
        attribute.type === 'JSXAttribute' &&
        attribute.name.type === 'JSXIdentifier' &&
        attribute.name.name === 'keyExtractor',
    ) ?? null
  );
}

function identifierUsed(node, targetName) {
  if (!node || !targetName) return false;

  if (node.type === 'Identifier') {
    return node.name === targetName;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || !value) continue;

    if (!value) continue;

    if (Array.isArray(value)) {
      if (value.some((item) => identifierUsed(item, targetName))) {
        return true;
      }
      continue;
    }

    if (typeof value === 'object' && identifierUsed(value, targetName)) {
      return true;
    }
  }

  return false;
}

function usesIndexInReturn(functionNode) {
  const secondParam = functionNode.params[1];
  if (!secondParam || secondParam.type !== 'Identifier') return false;

  const indexName = secondParam.name;

  if (functionNode.body.type !== 'BlockStatement') {
    return identifierUsed(functionNode.body, indexName);
  }

  for (const statement of functionNode.body.body) {
    if (statement.type === 'ReturnStatement' && statement.argument) {
      return identifierUsed(statement.argument, indexName);
    }
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'FlashList/FlatList의 keyExtractor에서 index 기반 key 사용을 금지합니다.',
      recommended: false,
    },
    messages: {
      noIndexKey:
        'keyExtractor에서 index를 key로 사용하지 마세요. 아이템 고유 id를 사용하세요. (예: (item) => item.id.toString())',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      JSXOpeningElement(node) {
        const keyExtractorAttribute = findKeyExtractorAttribute(node);
        const expression = getAttributeExpression(keyExtractorAttribute);

        if (
          expression?.type !== 'ArrowFunctionExpression' &&
          expression?.type !== 'FunctionExpression'
        ) {
          return;
        }

        if (!usesIndexInReturn(expression)) return;

        context.report({
          node: keyExtractorAttribute,
          messageId: 'noIndexKey',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-index-key-extractor');
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
// tester.run('no-index-key-extractor', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList keyExtractor={(item) => item.id.toString()} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList keyExtractor={(_, index) => index.toString()} />;',
//       errors: [{ messageId: 'noIndexKey' }],
//     },
//   ],
// });
