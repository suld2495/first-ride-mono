'use strict';
const { isUiLayerFile } = require('../path-groups');

const COLOR_PROPS = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'shadowColor',
  'placeholderTextColor',
  'tintColor',
]);

const SIZE_PROPS = new Set([
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'fontSize',
  'lineHeight',
  'borderRadius',
  'borderWidth',
  'gap',
]);

const COLOR_KEYWORDS = new Set([
  'black',
  'blue',
  'gray',
  'green',
  'grey',
  'orange',
  'pink',
  'purple',
  'red',
  'transparent',
  'white',
  'yellow',
]);

const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE = /^rgba?\s*\(/i;
const HSL_RE = /^hsla?\s*\(/i;

function isColorLiteral(value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('$')) return false;

  return (
    HEX_RE.test(value) ||
    RGB_RE.test(value) ||
    HSL_RE.test(value) ||
    COLOR_KEYWORDS.has(value.toLowerCase())
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Tamagui 컴포넌트의 스타일 prop에는 리터럴 대신 토큰 사용을 강제합니다.',
      recommended: false,
    },
    messages: {
      noRawColor:
        "Tamagui 색상 prop 에 리터럴을 사용하지 마세요. 토큰을 사용하세요. (예: '$background')",
      noRawSize:
        "Tamagui 사이즈 prop 에 리터럴을 사용하지 마세요. 토큰을 사용하세요. (예: '$4')",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    const isTarget = isUiLayerFile(context, filename);
    if (!isTarget) return {};

    return {
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier') return;

        const attributeName = node.name.name;
        if (!COLOR_PROPS.has(attributeName) && !SIZE_PROPS.has(attributeName)) {
          return;
        }

        if (!node.value) return;

        if (
          node.value.type === 'Literal' &&
          COLOR_PROPS.has(attributeName) &&
          isColorLiteral(node.value.value)
        ) {
          context.report({ node, messageId: 'noRawColor' });
          return;
        }

        if (node.value.type !== 'JSXExpressionContainer') return;

        const expression = node.value.expression;

        if (
          COLOR_PROPS.has(attributeName) &&
          expression.type === 'Literal' &&
          isColorLiteral(expression.value)
        ) {
          context.report({ node, messageId: 'noRawColor' });
          return;
        }

        if (
          SIZE_PROPS.has(attributeName) &&
          expression.type === 'Literal' &&
          typeof expression.value === 'number' &&
          expression.value !== 0
        ) {
          context.report({ node, messageId: 'noRawSize' });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./no-raw-tamagui-prop');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('no-raw-tamagui-prop', rule, {
//   valid: [{
//     filename: '/project/src/components/ui/card.tsx',
//     code: `<Stack padding="$4" backgroundColor="$background" />;`,
//   }],
//   invalid: [{
//     filename: '/project/src/components/ui/card.tsx',
//     code: `<Text fontSize={14} backgroundColor="#fff" />;`,
//     errors: [{ messageId: 'noRawSize' }, { messageId: 'noRawColor' }],
//   }],
// });
