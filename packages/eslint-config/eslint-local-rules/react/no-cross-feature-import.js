'use strict';

const path = require('path');

/**
 * 파일 경로에서 features/[featureName]/ 패턴을 추출한다.
 * 해당 패턴이 없으면 null을 반환한다.
 */
function getFeatureFromPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * @/ 앨리어스 import 경로에서 feature 이름을 추출한다.
 * @/features/[featureName]/... 패턴만 대상으로 한다.
 */
function getFeatureFromAliasImport(importSource) {
  const match = importSource.match(/^@\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

/**
 * import 경로와 현재 파일 경로를 받아 import 대상이 속한 feature 이름을 반환한다.
 * - 상대 경로(./ ../) → path.resolve로 절대 경로로 변환 후 분석
 * - @/ 앨리어스 경로 → 패턴 매칭으로 분석
 * - 그 외(node_modules 등) → null 반환
 */
function resolveImportedFeature(importSource, currentFilename) {
  if (importSource.startsWith('@/')) {
    return getFeatureFromAliasImport(importSource);
  }

  if (importSource.startsWith('.')) {
    const dir = path.dirname(currentFilename);
    const resolved = path.resolve(dir, importSource);
    return getFeatureFromPath(resolved);
  }

  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'features 하위 feature 간 직접 import 금지. 공통 레이어를 통해 접근하세요.',
      recommended: true,
    },
    messages: {
      noCrossFeature:
        '다른 feature 내부를 직접 import하지 마세요. 공통 레이어(components, hooks, utils 등)를 통해 접근하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename =
      typeof context.filename === 'string'
        ? context.filename
        : context.getFilename();

    const currentFeature = getFeatureFromPath(filename);

    // 현재 파일이 features 하위가 아니면 이 룰을 적용하지 않는다
    if (!currentFeature) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        const importedFeature = resolveImportedFeature(importSource, filename);

        if (importedFeature !== null && importedFeature !== currentFeature) {
          context.report({ node, messageId: 'noCrossFeature' });
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
 * const rule = require('./no-cross-feature-import');
 *
 * const tester = new RuleTester({
 *   languageOptions: {
 *     parserOptions: {
 *       ecmaVersion: 2020,
 *       sourceType: 'module',
 *     },
 *   },
 * });
 *
 * tester.run('no-cross-feature-import', rule, {
 *   valid: [
 *     // ✅ 같은 feature 내부 상대 경로 import
 *     {
 *       code: `import { AuthForm } from './components/AuthForm';`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *     },
 *     // ✅ 같은 feature 상위로 이동 후 다시 진입
 *     {
 *       code: `import { authUtils } from '../utils/authUtils';`,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *     },
 *     // ✅ @/ 앨리어스로 공통 components import
 *     {
 *       code: `import { Button } from '@/components/Button';`,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *     },
 *     // ✅ @/ 앨리어스로 공통 hooks import
 *     {
 *       code: `import { useUser } from '@/hooks/useUser';`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *     },
 *     // ✅ @/ 앨리어스로 utils import
 *     {
 *       code: `import { formatDate } from '@/utils/formatDate';`,
 *       filename: '/project/src/features/payment/utils/helper.ts',
 *     },
 *     // ✅ @/ 앨리어스로 같은 feature import
 *     {
 *       code: `import { AuthSchema } from '@/features/auth/types';`,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *     },
 *     // ✅ 현재 파일이 src/features/ 바깥 — 룰 미적용
 *     {
 *       code: `import { PaymentForm } from '@/features/payment/components/PaymentForm';`,
 *       filename: '/project/src/components/shared/Layout.tsx',
 *     },
 *     // ✅ node_modules import
 *     {
 *       code: `import React from 'react';`,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *     },
 *     // ✅ 절대경로지만 features 경로 아님
 *     {
 *       code: `import { theme } from '@/theme/colors';`,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ 상대 경로로 다른 feature의 컴포넌트 import
 *     {
 *       code: `import { PaymentForm } from '../payment/components/PaymentForm';`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *       errors: [{ messageId: 'noCrossFeature' }],
 *     },
 *     // ❌ 상대 경로로 두 단계 올라가 다른 feature 진입
 *     {
 *       code: `import { usePayment } from '../../features/payment/hooks/usePayment';`,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *       errors: [{ messageId: 'noCrossFeature' }],
 *     },
 *     // ❌ @/ 앨리어스로 다른 feature 진입
 *     {
 *       code: `import { usePayment } from '@/features/payment/hooks/usePayment';`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *       errors: [{ messageId: 'noCrossFeature' }],
 *     },
 *     // ❌ @/ 앨리어스로 다른 feature의 타입 import
 *     {
 *       code: `import type { PaymentType } from '@/features/payment/types';`,
 *       filename: '/project/src/features/auth/types.ts',
 *       errors: [{ messageId: 'noCrossFeature' }],
 *     },
 *     // ❌ 다른 feature의 api 레이어 직접 접근
 *     {
 *       code: `import { fetchPayment } from '../payment/api/paymentApi';`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *       errors: [{ messageId: 'noCrossFeature' }],
 *     },
 *     // ❌ 복수의 cross-feature import
 *     {
 *       code: `
 *         import { PaymentForm } from '@/features/payment/components/PaymentForm';
 *         import { useProfile } from '@/features/profile/hooks/useProfile';
 *       `,
 *       filename: '/project/src/features/auth/components/AuthForm.tsx',
 *       errors: [
 *         { messageId: 'noCrossFeature' },
 *         { messageId: 'noCrossFeature' },
 *       ],
 *     },
 *   ],
 * });
 */
