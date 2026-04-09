'use strict';
const {
  isComponentFile,
  isFeatureComponentFile,
  isThemeFile,
  isUiLayerFile,
} = require('../path-groups');

// ─────────────────────────────────────────────
//  기본 금지 패키지 목록
//  - 문자열이 '/'로 끝나면 prefix 매칭 (@tamagui/button 등)
//  - 그 외엔 정확히 일치하거나 하위 경로(tamagui/utils) 모두 금지
// ─────────────────────────────────────────────
const DEFAULT_FORBIDDEN_PACKAGES = [
  'tamagui',   // tamagui, tamagui/utils 등
  '@tamagui/', // @tamagui/button, @tamagui/core 등 모든 서브패키지
];

/**
 * import 소스가 금지 패키지 목록에 해당하는지 확인한다.
 * 일치하면 실제로 감지된 import 소스 문자열을 반환하고, 아니면 null을 반환한다.
 */
function matchForbiddenPackage(importSource, forbiddenPackages) {
  for (const pkg of forbiddenPackages) {
    if (pkg.endsWith('/')) {
      // prefix 매칭: '@tamagui/' → '@tamagui/button' 허용
      if (importSource.startsWith(pkg)) return importSource;
    } else {
      // 정확히 일치하거나 하위 경로인 경우: 'tamagui' → 'tamagui', 'tamagui/utils'
      if (importSource === pkg || importSource.startsWith(pkg + '/')) {
        return importSource;
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────
//  허용 경로 패턴
// ─────────────────────────────────────────────
function isAllowedFile(context, filename) {
  return isUiLayerFile(context, filename) || isThemeFile(context, filename);
}

function isTargetFile(context, filename) {
  return (
    isComponentFile(context, filename) || isFeatureComponentFile(context, filename)
  );
}

// ─────────────────────────────────────────────
//  Rule
// ─────────────────────────────────────────────

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'ui 레이어 외부에서 외부 UI 라이브러리 직접 import를 금지합니다. 래핑 컴포넌트를 통해 사용하세요.',
      recommended: true,
    },
    messages: {
      noDirectUiImport:
        '외부 UI 라이브러리를 직접 import하지 마세요. ui 레이어의 래핑 컴포넌트를 사용하세요. (감지된 패키지: {{packageName}})',
    },
    schema: [
      {
        type: 'object',
        properties: {
          /**
           * 기본 금지 목록에 추가할 패키지.
           * '/'로 끝나면 prefix 매칭, 아니면 exact + 하위 경로 매칭.
           * 예: ['react-native-paper', '@shopify/restyle', '@ui-kitten/']
           */
          packages: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            uniqueItems: true,
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename =
      typeof context.filename === 'string'
        ? context.filename
        : context.getFilename();

    // components, feature/components 외부는 검사하지 않음
    if (!isTargetFile(context, filename)) {
      return {};
    }

    // 허용 경로(ui 래퍼, 테마)에서는 직접 import 허용
    if (isAllowedFile(context, filename)) {
      return {};
    }

    const options          = context.options[0] || {};
    const extraPackages    = Array.isArray(options.packages) ? options.packages : [];
    const forbiddenPackages = [...DEFAULT_FORBIDDEN_PACKAGES, ...extraPackages];

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        const matched = matchForbiddenPackage(importSource, forbiddenPackages);

        if (matched !== null) {
          context.report({
            node,
            messageId: 'noDirectUiImport',
            data: { packageName: matched },
          });
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
 * const rule = require('./no-direct-external-ui-import');
 *
 * const tester = new RuleTester({
 *   languageOptions: {
 *     parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
 *   },
 * });
 *
 * tester.run('no-direct-external-ui-import', rule, {
 *   valid: [
 *     // ✅ src/components/ui/ — 래퍼 파일에서의 직접 import 허용
 *     {
 *       code: `import { Button } from 'tamagui';`,
 *       filename: '/p/src/components/ui/button.tsx',
 *     },
 *     // ✅ src/components/ui/ 하위 중첩 경로
 *     {
 *       code: `import { Stack } from 'tamagui';`,
 *       filename: '/p/src/components/ui/layout/stack.tsx',
 *     },
 *     // ✅ src/theme/ — 테마 파일에서의 직접 import 허용
 *     {
 *       code: `import { createTamagui } from 'tamagui';`,
 *       filename: '/p/src/theme/tamagui.config.ts',
 *     },
 *     // ✅ 허용된 래핑 컴포넌트를 통한 import
 *     {
 *       code: `import { Button } from '@/components/ui/button';`,
 *       filename: '/p/src/features/auth/components/login-form.tsx',
 *     },
 *     // ✅ 금지 목록에 없는 패키지 — 허용
 *     {
 *       code: `import { useCallback } from 'react';`,
 *       filename: '/p/src/components/card.tsx',
 *     },
 *     // ✅ 금지 목록에 없는 패키지 — react-native
 *     {
 *       code: `import { View, Text } from 'react-native';`,
 *       filename: '/p/src/features/auth/components/login-form.tsx',
 *     },
 *     // ✅ @tamagui/ prefix가 아닌 다른 @-스코프 패키지
 *     {
 *       code: `import { something } from '@other/library';`,
 *       filename: '/p/src/features/home/components/home-card.tsx',
 *     },
 *     // ✅ 옵션으로 추가된 패키지이지만 허용 경로 안
 *     {
 *       code: `import { Paper } from 'react-native-paper';`,
 *       filename: '/p/src/components/ui/paper-button.tsx',
 *       options: [{ packages: ['react-native-paper'] }],
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ 기본 금지 패키지 — 'tamagui' 정확히 일치
 *     {
 *       code: `import { Button } from 'tamagui';`,
 *       filename: '/p/src/features/auth/components/login-form.tsx',
 *       errors: [{ messageId: 'noDirectUiImport', data: { packageName: 'tamagui' } }],
 *     },
 *     // ❌ tamagui 하위 경로 (tamagui/utils)
 *     {
 *       code: `import { getTokens } from 'tamagui/core';`,
 *       filename: '/p/src/features/home/hooks/useHomeData.ts',
 *       errors: [{ messageId: 'noDirectUiImport', data: { packageName: 'tamagui/core' } }],
 *     },
 *     // ❌ @tamagui/ prefix 매칭
 *     {
 *       code: `import { Checkbox } from '@tamagui/checkbox';`,
 *       filename: '/p/src/components/card.tsx',
 *       errors: [{ messageId: 'noDirectUiImport', data: { packageName: '@tamagui/checkbox' } }],
 *     },
 *     // ❌ @tamagui/ prefix — 다른 서브패키지
 *     {
 *       code: `import { AnimatePresence } from '@tamagui/animate-presence';`,
 *       filename: '/p/src/features/auth/components/auth-form.tsx',
 *       errors: [{ messageId: 'noDirectUiImport', data: { packageName: '@tamagui/animate-presence' } }],
 *     },
 *     // ❌ src/app/ 에서 tamagui 직접 import
 *     {
 *       code: `import { Text } from 'tamagui';`,
 *       filename: '/p/src/app/(tabs)/index.tsx',
 *       errors: [{ messageId: 'noDirectUiImport' }],
 *     },
 *     // ❌ src/hooks/ 에서 tamagui 직접 import
 *     {
 *       code: `import { useTheme } from 'tamagui';`,
 *       filename: '/p/src/hooks/useThemeColors.ts',
 *       errors: [{ messageId: 'noDirectUiImport' }],
 *     },
 *     // ❌ 옵션으로 추가한 패키지 — 허용되지 않은 경로
 *     {
 *       code: `import { Button } from 'react-native-paper';`,
 *       filename: '/p/src/features/home/components/home-card.tsx',
 *       options: [{ packages: ['react-native-paper'] }],
 *       errors: [{ messageId: 'noDirectUiImport', data: { packageName: 'react-native-paper' } }],
 *     },
 *     // ❌ 옵션으로 추가한 prefix 패키지
 *     {
 *       code: `import { ThemeProvider } from '@shopify/restyle';`,
 *       filename: '/p/src/components/layout.tsx',
 *       options: [{ packages: ['@shopify/'] }],
 *       errors: [{ messageId: 'noDirectUiImport', data: { packageName: '@shopify/restyle' } }],
 *     },
 *     // ❌ 복수의 금지 import
 *     {
 *       code: `
 *         import { Button } from 'tamagui';
 *         import { Input } from '@tamagui/input';
 *       `,
 *       filename: '/p/src/features/auth/components/login-form.tsx',
 *       errors: [
 *         { messageId: 'noDirectUiImport', data: { packageName: 'tamagui' } },
 *         { messageId: 'noDirectUiImport', data: { packageName: '@tamagui/input' } },
 *       ],
 *     },
 *   ],
 * });
 */
