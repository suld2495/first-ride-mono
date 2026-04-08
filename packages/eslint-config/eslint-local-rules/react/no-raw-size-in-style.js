'use strict';

const SIZE_PROPERTIES = new Set([
  'fontSize', 'lineHeight', 'letterSpacing',
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'paddingHorizontal', 'paddingVertical',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'marginHorizontal', 'marginVertical',
  'borderRadius', 'borderWidth', 'gap', 'rowGap', 'columnGap',
]);

/**
 * Property 노드의 키 이름을 반환한다.
 * computed property ({ [expr]: value }) 는 null을 반환한다.
 */
function getPropertyName(node) {
  if (node.computed) return null;
  if (node.key.type === 'Identifier') return node.key.name;
  if (node.key.type === 'Literal') return String(node.key.value);
  return null;
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

const ALLOWED_PATH_PATTERNS = [
  /[/\\]src[/\\]theme[/\\]/,
  /[/\\]src[/\\]components[/\\]design[/\\]/,
];

function isAllowedFile(filename) {
  return ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(filename));
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'StyleSheet.create() 또는 style prop 안에서 사이즈/간격 속성에 숫자 리터럴 직접 사용 금지',
      recommended: true,
    },
    messages: {
      noRawSize:
        "사이즈 리터럴을 직접 사용하지 마세요.\n theme 레이어의 토큰 또는 Tamagui 토큰을 사용하세요. (예: '$4', spacing.md)",
    },
    schema: [],
  },

  create(context) {
    const filename =
      typeof context.filename === 'string'
        ? context.filename
        : context.getFilename();

    if (isAllowedFile(filename)) {
      return {};
    }

    return {
      Property(node) {
        const propName = getPropertyName(node);
        if (!propName) return;
        if (!SIZE_PROPERTIES.has(propName)) return;

        const val = node.value;

        // 숫자 리터럴이 아니면 패스 (변수·표현식 사용은 허용)
        if (val.type !== 'Literal' || typeof val.value !== 'number') return;

        // 0은 허용 (margin: 0, padding: 0 등)
        if (val.value === 0) return;

        if (isInStyleContext(node)) {
          context.report({ node: val, messageId: 'noRawSize' });
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
 * const rule = require('./no-raw-size-in-style');
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
 * tester.run('no-raw-size-in-style', rule, {
 *   valid: [
 *     // ✅ theme 토큰 사용 — JSX style
 *     {
 *       code: `<Text style={{ fontSize: typography.body }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ theme 토큰 사용 — StyleSheet.create
 *     {
 *       code: `
 *         const s = StyleSheet.create({
 *           box: { padding: spacing.md },
 *         });
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ 0 허용 — margin: 0
 *     {
 *       code: `<View style={{ margin: 0, padding: 0 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ 0 허용 — StyleSheet.create
 *     {
 *       code: `
 *         const s = StyleSheet.create({
 *           box: { borderWidth: 0 },
 *         });
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ flex 속성은 허용
 *     {
 *       code: `<View style={{ flex: 1 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ zIndex 허용
 *     {
 *       code: `<View style={{ zIndex: 10 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ 대상 아닌 속성의 숫자 — opacity
 *     {
 *       code: `<View style={{ opacity: 0.5 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ src/theme/ — 허용 경로
 *     {
 *       code: `export const md = 16;`,
 *       filename: '/project/src/theme/spacing.ts',
 *     },
 *     // ✅ src/components/design/ — 허용 경로
 *     {
 *       code: `<View style={{ padding: 16 }} />`,
 *       filename: '/project/src/components/design/Token.tsx',
 *     },
 *     // ✅ style 외 컨텍스트의 숫자
 *     {
 *       code: `const size = 16;`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ contentContainerStyle에 토큰 사용
 *     {
 *       code: `<ScrollView contentContainerStyle={{ padding: spacing.lg }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ fontSize 리터럴 — JSX style
 *     {
 *       code: `<Text style={{ fontSize: 16 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ padding 리터럴 — JSX style
 *     {
 *       code: `<View style={{ padding: 8 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ width 리터럴 — StyleSheet.create
 *     {
 *       code: `
 *         const s = StyleSheet.create({
 *           box: { width: 100 },
 *         });
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ borderRadius 리터럴 — JSX style
 *     {
 *       code: `<View style={{ borderRadius: 4 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ gap 리터럴 — StyleSheet.create
 *     {
 *       code: `
 *         const s = StyleSheet.create({
 *           row: { gap: 12 },
 *         });
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ marginHorizontal 리터럴 — JSX style
 *     {
 *       code: `<View style={{ marginHorizontal: 16 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ lineHeight 리터럴 — JSX style
 *     {
 *       code: `<Text style={{ lineHeight: 24 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ 배열 style 안의 리터럴
 *     {
 *       code: `<View style={[{ paddingVertical: 12 }]} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ contentContainerStyle에 리터럴
 *     {
 *       code: `<ScrollView contentContainerStyle={{ padding: 20 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }],
 *     },
 *     // ❌ 복수 위반 — 한 오브젝트 안에 여러 개
 *     {
 *       code: `<View style={{ padding: 8, margin: 16 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noRawSize' }, { messageId: 'noRawSize' }],
 *     },
 *   ],
 * });
 */
