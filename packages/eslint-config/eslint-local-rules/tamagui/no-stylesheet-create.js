'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Tamagui 사용 프로젝트에서는 StyleSheet.create 사용을 제한합니다.',
      recommended: false,
    },
    messages: {
      noStyleSheetCreate:
        "StyleSheet.create() 대신 Tamagui 토큰을 사용하세요.\n (예: padding='$4', backgroundColor='$background')",
      noStyleSheetImport:
        "StyleSheet.create() 대신 Tamagui 토큰을 사용하세요.\n (예: padding='$4', backgroundColor='$background')",
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native') return;

        const hasStyleSheetImport = node.specifiers.some(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            specifier.imported.name === 'StyleSheet',
        );

        if (hasStyleSheetImport) {
          context.report({ node, messageId: 'noStyleSheetImport' });
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          !node.callee.computed &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'StyleSheet' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'create'
        ) {
          context.report({ node, messageId: 'noStyleSheetCreate' });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./no-stylesheet-create');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('no-stylesheet-create', rule, {
//   valid: [{
//     filename: '/project/src/components/ui/card.tsx',
//     code: `<Stack padding="$4" backgroundColor="$background" />;`,
//   }],
//   invalid: [{
//     filename: '/project/src/components/ui/card.tsx',
//     code: `import { StyleSheet } from 'react-native'; const styles = StyleSheet.create({ box: { padding: 16 } });`,
//     errors: [{ messageId: 'noStyleSheetImport' }, { messageId: 'noStyleSheetCreate' }],
//   }],
// });
