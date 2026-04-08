'use strict';
const {
  isThemeFile,
  isUiLayerFile,
  normalizePath,
} = require('../path-groups');

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

const STYLE_PROPS = new Set([...COLOR_PROPS, ...SIZE_PROPS]);

const CSS_COLOR_KEYWORDS = new Set([
  'aliceblue',
  'antiquewhite',
  'aqua',
  'aquamarine',
  'azure',
  'beige',
  'bisque',
  'black',
  'blue',
  'blueviolet',
  'brown',
  'burlywood',
  'cadetblue',
  'chartreuse',
  'chocolate',
  'coral',
  'cornflowerblue',
  'cornsilk',
  'crimson',
  'cyan',
  'darkblue',
  'darkcyan',
  'darkgoldenrod',
  'darkgray',
  'darkgreen',
  'darkgrey',
  'darkkhaki',
  'darkmagenta',
  'darkolivegreen',
  'darkorange',
  'darkorchid',
  'darkred',
  'darksalmon',
  'darkseagreen',
  'darkslateblue',
  'darkslategray',
  'darkslategrey',
  'darkturquoise',
  'darkviolet',
  'deeppink',
  'deepskyblue',
  'dimgray',
  'dimgrey',
  'dodgerblue',
  'firebrick',
  'floralwhite',
  'forestgreen',
  'fuchsia',
  'gainsboro',
  'ghostwhite',
  'gold',
  'goldenrod',
  'gray',
  'green',
  'greenyellow',
  'grey',
  'honeydew',
  'hotpink',
  'indianred',
  'indigo',
  'ivory',
  'khaki',
  'lavender',
  'lavenderblush',
  'lawngreen',
  'lemonchiffon',
  'lightblue',
  'lightcoral',
  'lightcyan',
  'lightgoldenrodyellow',
  'lightgray',
  'lightgreen',
  'lightgrey',
  'lightpink',
  'lightsalmon',
  'lightseagreen',
  'lightskyblue',
  'lightslategray',
  'lightslategrey',
  'lightsteelblue',
  'lightyellow',
  'lime',
  'limegreen',
  'linen',
  'magenta',
  'maroon',
  'mediumaquamarine',
  'mediumblue',
  'mediumorchid',
  'mediumpurple',
  'mediumseagreen',
  'mediumslateblue',
  'mediumspringgreen',
  'mediumturquoise',
  'mediumvioletred',
  'midnightblue',
  'mintcream',
  'mistyrose',
  'moccasin',
  'navajowhite',
  'navy',
  'oldlace',
  'olive',
  'olivedrab',
  'orange',
  'orangered',
  'orchid',
  'palegoldenrod',
  'palegreen',
  'paleturquoise',
  'palevioletred',
  'papayawhip',
  'peachpuff',
  'peru',
  'pink',
  'plum',
  'powderblue',
  'purple',
  'rebeccapurple',
  'red',
  'rosybrown',
  'royalblue',
  'saddlebrown',
  'salmon',
  'sandybrown',
  'seagreen',
  'seashell',
  'sienna',
  'silver',
  'skyblue',
  'slateblue',
  'slategray',
  'slategrey',
  'snow',
  'springgreen',
  'steelblue',
  'tan',
  'teal',
  'thistle',
  'tomato',
  'turquoise',
  'violet',
  'wheat',
  'white',
  'whitesmoke',
  'yellow',
  'yellowgreen',
  'transparent',
]);

const HEX_RE = /^#/i;
const RGB_RE = /^rgba?\s*\(/i;
const HSL_RE = /^hsla?\s*\(/i;

function shouldSkipFile(filename) {
  const normalized = normalizePath(filename);

  return (
    !/\/(?:src|apps\/native)\/.*\.(ts|tsx)$/.test(normalized) ||
    isUiLayerFile(normalized) ||
    isThemeFile(normalized)
  );
}

function isColorLiteral(value) {
  if (typeof value !== 'string') return false;

  return (
    HEX_RE.test(value) ||
    RGB_RE.test(value) ||
    HSL_RE.test(value) ||
    CSS_COLOR_KEYWORDS.has(value.toLowerCase())
  );
}

function getAttributeName(node) {
  if (node.name.type !== 'JSXIdentifier') return null;
  return node.name.name;
}

function checkRawStyleValue(context, node) {
  const attributeName = getAttributeName(node);
  if (!attributeName || !STYLE_PROPS.has(attributeName) || !node.value) return;

  if (
    COLOR_PROPS.has(attributeName) &&
    node.value.type === 'Literal' &&
    isColorLiteral(node.value.value)
  ) {
    context.report({ node, messageId: 'noRawColorOutsideUi' });
    return;
  }

  if (
    node.value.type !== 'JSXExpressionContainer' ||
    node.value.expression.type !== 'Literal'
  ) {
    return;
  }

  const literalValue = node.value.expression.value;

  if (COLOR_PROPS.has(attributeName) && isColorLiteral(literalValue)) {
    context.report({ node, messageId: 'noRawColorOutsideUi' });
    return;
  }

  if (
    SIZE_PROPS.has(attributeName) &&
    typeof literalValue === 'number' &&
    literalValue !== 0
  ) {
    context.report({ node, messageId: 'noRawSizeOutsideUi' });
  }
}

function checkTamaguiTokenString(context, node) {
  const attributeName = getAttributeName(node);
  if (!attributeName || !STYLE_PROPS.has(attributeName) || !node.value) return;

  if (
    node.value.type === 'Literal' &&
    typeof node.value.value === 'string' &&
    node.value.value.startsWith('$')
  ) {
    context.report({ node, messageId: 'noTamaguiTokenStringOutsideUi' });
  }
}

const noRawStyleValueOutsideUi = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'ui 레이어 외부에서 스타일 prop에 색상/사이즈 리터럴 직접 사용을 금지합니다.',
      recommended: false,
    },
    messages: {
      noRawColorOutsideUi:
        '색상 리터럴을 직접 사용하지 마세요.\n theme 레이어에서 import한 토큰을 사용하세요. (예: colors.warning)',
      noRawSizeOutsideUi:
        '사이즈 리터럴을 직접 사용하지 마세요.\n theme 레이어에서 import한 토큰을 사용하세요. (예: spacing.md)',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (
      shouldSkipFile(filename) ||
      isUiLayerFile(context, filename) ||
      isThemeFile(context, filename)
    ) {
      return {};
    }

    return {
      JSXAttribute(node) {
        checkRawStyleValue(context, node);
      },
    };
  },
};

const noTamaguiTokenStringOutsideUi = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'ui 레이어 외부에서 Tamagui 토큰 문자열을 스타일 prop에 직접 사용하는 것을 금지합니다.',
      recommended: false,
    },
    messages: {
      noTamaguiTokenStringOutsideUi:
        "Tamagui 토큰 문자열('$...')을 직접 사용하지 마세요.\n UI 라이브러리 교체 시 모두 수정해야 하는 위험이 있습니다.\n theme 레이어에서 토큰을 정의하고 import해서 사용하세요.\n (예: import { colors } from '@/theme/colors')",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (shouldSkipFile(filename)) return {};

    return {
      JSXAttribute(node) {
        checkTamaguiTokenString(context, node);
      },
    };
  },
};

module.exports = {
  rules: {
    'no-raw-style-value-outside-ui': noRawStyleValueOutsideUi,
    'no-tamagui-token-string-outside-ui': noTamaguiTokenStringOutsideUi,
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rules = require('./no-raw-style-value-outside-ui').rules;
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
//
// tester.run('no-raw-style-value-outside-ui', rules['no-raw-style-value-outside-ui'], {
//   valid: [
//     {
//       filename: '/project/src/features/home/screen.tsx',
//       code: `
//         import { colors } from '@/theme/colors';
//         import { spacing } from '@/theme/spacing';
//         <Text color={colors.warning} />;
//         <Stack padding={spacing.md} />;
//         <Stack padding={0} />;
//       `,
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/home/screen.tsx',
//       code: `<Text color="#FF0000" />;`,
//       errors: [{ messageId: 'noRawColorOutsideUi' }],
//     },
//     {
//       filename: '/project/src/features/home/screen.tsx',
//       code: `<Stack padding={16} />;`,
//       errors: [{ messageId: 'noRawSizeOutsideUi' }],
//     },
//   ],
// });
//
// tester.run('no-tamagui-token-string-outside-ui', rules['no-tamagui-token-string-outside-ui'], {
//   valid: [
//     {
//       filename: '/project/src/features/home/screen.tsx',
//       code: `
//         import { colors } from '@/theme/colors';
//         <Text color={colors.warning} />;
//       `,
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/home/screen.tsx',
//       code: `<Text color="$orange8" />;`,
//       errors: [{ messageId: 'noTamaguiTokenStringOutsideUi' }],
//     },
//   ],
// });
