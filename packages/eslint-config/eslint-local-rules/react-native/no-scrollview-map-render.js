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

function containsMapRender(expression, visited = new Set()) {
  if (!expression || typeof expression !== 'object') return false;
  if (visited.has(expression)) return false;

  visited.add(expression);

  if (
    expression.type === 'CallExpression' &&
    expression.callee.type === 'MemberExpression' &&
    !expression.callee.computed &&
    expression.callee.property.type === 'Identifier' &&
    expression.callee.property.name === 'map'
  ) {
    return true;
  }

  for (const [key, value] of Object.entries(expression)) {
    if (key === 'parent') continue;
    if (!value) continue;

    if (Array.isArray(value)) {
      if (value.some((item) => containsMapRender(item, visited))) {
        return true;
      }
      continue;
    }

    if (typeof value === 'object' && containsMapRender(value, visited)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'ScrollView 안에서 .map() 으로 리스트를 렌더링하는 것을 금지합니다.',
      recommended: false,
    },
    messages: {
      noScrollViewMap:
        'ScrollView 안에서 .map()으로 리스트를 렌더링하지 마세요. FlashList를 사용하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      JSXElement(node) {
        if (getJSXTagName(node.openingElement.name) !== 'ScrollView') return;

        for (const child of node.children) {
          if (child.type === 'JSXExpressionContainer' && containsMapRender(child.expression)) {
            context.report({
              node: child,
              messageId: 'noScrollViewMap',
            });
          }
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-scrollview-map-render');
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
// tester.run('no-scrollview-map-render', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<FlashList data={items} renderItem={renderItem} estimatedItemSize={100} />;',
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/list/view.tsx',
//       code: '<ScrollView>{items.map((item) => <Item key={item.id} item={item} />)}</ScrollView>;',
//       errors: [{ messageId: 'noScrollViewMap' }],
//     },
//   ],
// });
