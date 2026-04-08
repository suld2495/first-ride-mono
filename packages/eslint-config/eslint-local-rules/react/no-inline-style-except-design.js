'use strict';
const { isThemeFile, isUiLayerFile } = require('../path-groups');

function isAllowedFile(context, filename) {
  return isThemeFile(context, filename) || isUiLayerFile(context, filename);
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'JSX style prop에 인라인 객체 리터럴({ ... }) 직접 사용 금지. UI 레이어 외부에서는 theme/token 값을 props로 전달하세요.',
      recommended: true,
    },
    messages: {
      noInlineStyle:
        '인라인 스타일 객체를 직접 사용하지 마세요.\n src/components/ui/ 내부에서는 Tamagui token prop을 사용하고, 그 외 레이어에서는 theme/token 값을 props로 전달하세요.',
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
      JSXAttribute(node) {
        // name이 'style'인 경우만 대상으로 한다
        if (
          node.name.type !== 'JSXIdentifier' ||
          node.name.name !== 'style'
        ) {
          return;
        }

        // value가 JSXExpressionContainer가 아니면 스킵
        if (!node.value || node.value.type !== 'JSXExpressionContainer') {
          return;
        }

        const expr = node.value.expression;

        // style={{ ... }} — ObjectExpression 직접 사용: 금지
        if (expr.type === 'ObjectExpression') {
          context.report({ node: expr, messageId: 'noInlineStyle' });
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
 * const rule = require('./no-inline-style-except-design');
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
 * tester.run('no-inline-style-except-design', rule, {
 *   valid: [
 *     // ✅ StyleSheet.create로 분리된 스타일 참조
 *     {
 *       code: `<View style={styles.container} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ 배열 스타일 — 변수만 포함
 *     {
 *       code: `<View style={[styles.base, isActive && styles.active]} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ 변수 단독 참조
 *     {
 *       code: `<Text style={textStyle} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ style이 아닌 다른 prop — 인라인 객체여도 허용
 *     {
 *       code: `<View hitSlop={{ top: 10, bottom: 10 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ src/theme/ — 허용 경로
 *     {
 *       code: `<View style={{ padding: 8 }} />`,
 *       filename: '/project/src/theme/tokens.ts',
 *     },
 *     // ✅ src/components/ui/ — 허용 경로
 *     {
 *       code: `<View style={{ color: '#fff' }} />`,
 *       filename: '/project/src/components/ui/Button.tsx',
 *     },
 *     // ✅ style 없음
 *     {
 *       code: `<View />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ style={undefined}
 *     {
 *       code: `<View style={undefined} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *     // ✅ 삼항 연산자로 변수 선택
 *     {
 *       code: `<View style={isActive ? styles.active : styles.inactive} />`,
 *       filename: '/project/src/features/Home.tsx',
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ 단순 인라인 객체
 *     {
 *       code: `<View style={{ padding: 10 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noInlineStyle' }],
 *     },
 *     // ❌ 복수 속성 인라인 객체
 *     {
 *       code: `<Text style={{ color: 'red', fontSize: 14 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noInlineStyle' }],
 *     },
 *     // ❌ 빈 인라인 객체
 *     {
 *       code: `<View style={{}} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noInlineStyle' }],
 *     },
 *     // ❌ theme 토큰을 사용하더라도 인라인 객체면 금지
 *     {
 *       code: `<View style={{ padding: spacing.md }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noInlineStyle' }],
 *     },
 *     // ❌ 중첩 컴포넌트 각각에서 위반
 *     {
 *       code: `
 *         <>
 *           <View style={{ flex: 1 }} />
 *           <Text style={{ fontWeight: 'bold' }} />
 *         </>
 *       `,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noInlineStyle' }, { messageId: 'noInlineStyle' }],
 *     },
 *     // ❌ 함수 호출 반환값이 아닌 객체 리터럴
 *     {
 *       code: `<View style={{ ...baseStyle, margin: 0 }} />`,
 *       filename: '/project/src/features/Home.tsx',
 *       errors: [{ messageId: 'noInlineStyle' }],
 *     },
 *   ],
 * });
 */
