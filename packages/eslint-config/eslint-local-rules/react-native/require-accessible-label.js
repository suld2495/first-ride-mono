'use strict';

const TARGET_COMPONENTS = new Set([
  'TouchableOpacity',
  'Pressable',
  'TouchableHighlight',
]);

function getJSXTagName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') return nameNode.property.name;
  return null;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'TouchableOpacity, Pressable, TouchableHighlight 에 accessibilityLabel 명시를 강제합니다.',
      recommended: false,
    },
    messages: {
      missingAccessibleLabel:
        'TouchableOpacity/Pressable 에는 반드시 accessibilityLabel 을 명시하세요.',
    },
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        const componentName = getJSXTagName(node.name);
        if (!componentName || !TARGET_COMPONENTS.has(componentName)) return;

        const hasAccessibleLabel = node.attributes.some(
          (attribute) =>
            attribute.type === 'JSXAttribute' &&
            attribute.name.type === 'JSXIdentifier' &&
            attribute.name.name === 'accessibilityLabel',
        );

        if (!hasAccessibleLabel) {
          context.report({ node, messageId: 'missingAccessibleLabel' });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./require-accessible-label');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('require-accessible-label', rule, {
//   valid: [{
//     filename: '/project/src/features/auth/login.tsx',
//     code: `<TouchableOpacity accessibilityLabel="로그인 버튼" onPress={handlePress} />`,
//   }],
//   invalid: [{
//     filename: '/project/src/features/auth/login.tsx',
//     code: `<Pressable onPress={handlePress} />`,
//     errors: [{ messageId: 'missingAccessibleLabel' }],
//   }],
// });
