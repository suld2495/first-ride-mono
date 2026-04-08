'use strict';
const { isThemeFile, isUiLayerFile } = require('../path-groups');

// CSS Named Colors (Level 1–4) + transparent
const CSS_COLOR_KEYWORDS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
  'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
  'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
  'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
  'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
  'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick',
  'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
  'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo',
  'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue',
  'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
  'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen',
  'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
  'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
  'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite',
  'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
  'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink',
  'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue',
  'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver',
  'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
  'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white',
  'whitesmoke', 'yellow', 'yellowgreen', 'transparent',
]);

const HEX_RE = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_RE = /^rgba?\s*\(/i;
const HSL_RE = /^hsla?\s*\(/i;

function isColorLiteral(value) {
  if (typeof value !== 'string') return false;
  if (HEX_RE.test(value)) return true;
  if (RGB_RE.test(value)) return true;
  if (HSL_RE.test(value)) return true;
  if (CSS_COLOR_KEYWORDS.has(value.toLowerCase())) return true;
  return false;
}

/**
 * AST를 위로 순회하며 현재 노드가 style 관련 컨텍스트 안에 있는지 확인한다.
 * - JSXAttribute name이 "style" 또는 ~Style 인 경우
 * - StyleSheet.create() 호출의 인자인 경우
 */
function isInStyleContext(node) {
  let current = node;

  while (current) {
    const parent = current.parent;
    if (!parent) break;

    // JSXAttribute: style={...} 또는 contentContainerStyle={...} 등
    if (parent.type === 'JSXAttribute' && parent.name) {
      const attrName =
        parent.name.type === 'JSXIdentifier' ? parent.name.name : '';
      if (attrName === 'style' || /Style$/.test(attrName)) {
        return true;
      }
    }

    // StyleSheet.create({...})
    if (
      parent.type === 'CallExpression' &&
      parent.callee.type === 'MemberExpression' &&
      parent.callee.object.type === 'Identifier' &&
      parent.callee.object.name === 'StyleSheet' &&
      parent.callee.property.type === 'Identifier' &&
      parent.callee.property.name === 'create'
    ) {
      return true;
    }

    current = parent;
  }

  return false;
}

function isAllowedFile(context, filename) {
  return isThemeFile(context, filename) || isUiLayerFile(context, filename);
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'StyleSheet.create() 또는 style prop 안에서 색상 리터럴 직접 사용 금지',
      recommended: true,
    },
    messages: {
      noRawColor:
        '색상 리터럴을 직접 사용하지 마세요.\n ui 레이어 내부에서는 Tamagui token prop을 사용하고, 그 외 레이어에서는 theme 레이어의 token 값을 props로 전달하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename =
      typeof context.filename === 'string'
        ? context.filename
        : context.getFilename();

    if (isAllowedFile(context, filename)) {
      return {};
    }

    return {
      Literal(node) {
        if (isColorLiteral(node.value) && isInStyleContext(node)) {
          context.report({ node, messageId: 'noRawColor' });
        }
      },
    };
  },
};

/*
 * ─────────────────────────────────────────────
 *  RuleTester 테스트 케이스
 * ─────────────────────────────────────────────
 *
 * const { RuleTester } = require('eslint');
 * const rule = require('./no-raw-color-in-style');
 *
 * const tester = new RuleTester({
 *   languageOptions: {
 *     parserOptions: {
 *       ecmaFeatures: { jsx: true },
 *       ecmaVersion: 2020,
 *       sourceType: 'module',
 *     },
 *   },
 * });
 *
 * tester.run('no-raw-color-in-style', rule, {
 *   valid: [
 *     // ✅ theme 토큰 변수 사용 — JSX style
 *     {
 *       code: `<View style={{ backgroundColor: colors.primary }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ theme 토큰 변수 사용 — StyleSheet.create
 *     {
 *       code: `
 *         const styles = StyleSheet.create({
 *           container: { backgroundColor: colors.background },
 *         });
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ style과 무관한 컨텍스트의 색상 문자열
 *     {
 *       code: `const label = 'red';`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ src/theme/ 파일 — 허용 경로
 *     {
 *       code: `export const primary = '#FF0000';`,
 *       filename: '/project/src/theme/colors.ts',
 *     },
 *     // ✅ src/components/ui/ 파일 — 허용 경로
 *     {
 *       code: `<View style={{ color: '#fff' }} />`,
 *       filename: '/project/src/components/ui/Token.tsx',
 *     },
 *     // ✅ style prop이 아닌 다른 prop의 문자열
 *     {
 *       code: `<Text accessibilityLabel="red label">text</Text>`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ contentContainerStyle에 토큰 사용
 *     {
 *       code: `<ScrollView contentContainerStyle={{ flex: 1, backgroundColor: theme.bg }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ HEX — JSX style
 *     {
 *       code: `<View style={{ color: '#fff' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ HEX 8자리 — JSX style
 *     {
 *       code: `<View style={{ backgroundColor: '#ffffff99' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ RGB — StyleSheet.create
 *     {
 *       code: `
 *         const styles = StyleSheet.create({
 *           box: { borderColor: 'rgb(255, 0, 0)' },
 *         });
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ RGBA — JSX style
 *     {
 *       code: `<View style={{ shadowColor: 'rgba(0,0,0,0.5)' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ HSL — JSX style
 *     {
 *       code: `<View style={{ color: 'hsl(0, 100%, 50%)' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ CSS 색상 키워드 'red'
 *     {
 *       code: `<View style={{ backgroundColor: 'red' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ CSS 색상 키워드 'transparent'
 *     {
 *       code: `<View style={{ backgroundColor: 'transparent' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ contentContainerStyle에 HEX
 *     {
 *       code: `<ScrollView contentContainerStyle={{ backgroundColor: '#000' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ 배열 style에 인라인 HEX
 *     {
 *       code: `<View style={[{ color: '#FF0000' }]} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *     // ❌ 대소문자 무관 키워드 'WHITE'
 *     {
 *       code: `<View style={{ color: 'WHITE' }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawColor' }],
 *     },
 *   ],
 * });
 */
