'use strict';

const {
  isAppEntryFile,
  isComponentFile,
  isLayerImportPath,
} = require('../path-groups');

function isRestrictedFile(context, filename) {
  return isComponentFile(context, filename) || isAppEntryFile(context, filename);
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'components 또는 app 레이어에서 store 직접 import를 금지합니다. hooks를 통해 접근하세요.',
      recommended: true,
    },
    messages: {
      noStoreImport:
        'components 또는 app에서 store를 직접 import하지 마세요. hooks를 통해 접근하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename =
      typeof context.filename === 'string'
        ? context.filename
        : context.getFilename();

    // 현재 파일이 components 또는 app 레이어가 아니면 룰 미적용
    if (!isRestrictedFile(context, filename)) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;

        if (isLayerImportPath(context, importSource, 'store', filename)) {
          context.report({ node, messageId: 'noStoreImport' });
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
 * const rule = require('./no-store-import-in-components');
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
 * tester.run('no-store-import-in-components', rule, {
 *   valid: [
 *     // ✅ hooks를 통한 store 접근 — components
 *     {
 *       code: `import { useAuth } from '@/hooks/useAuth';`,
 *       filename: '/project/src/components/Button.tsx',
 *     },
 *     // ✅ hooks를 통한 store 접근 — app
 *     {
 *       code: `import { useAuth } from '@/hooks/useAuth';`,
 *       filename: '/project/src/app/(tabs)/index.tsx',
 *     },
 *     // ✅ store import지만 현재 파일이 hooks — 허용
 *     {
 *       code: `import { useAuthStore } from '@/store/authStore';`,
 *       filename: '/project/src/hooks/useAuth.ts',
 *     },
 *     // ✅ store import지만 현재 파일이 features — 룰 미적용
 *     {
 *       code: `import { useAuthStore } from '@/store/authStore';`,
 *       filename: '/project/src/features/auth/hooks/useAuth.ts',
 *     },
 *     // ✅ store import지만 현재 파일이 store 자체 — 룰 미적용
 *     {
 *       code: `import { createStore } from '@/store/createStore';`,
 *       filename: '/project/src/store/authStore.ts',
 *     },
 *     // ✅ components에서 store 외 경로 import
 *     {
 *       code: `import { theme } from '@/theme/colors';`,
 *       filename: '/project/src/components/Button.tsx',
 *     },
 *     // ✅ components에서 node_modules import
 *     {
 *       code: `import React from 'react';`,
 *       filename: '/project/src/components/Button.tsx',
 *     },
 *     // ✅ 상대 경로이지만 store가 아닌 경로
 *     {
 *       code: `import { helper } from '../../utils/helper';`,
 *       filename: '/project/src/components/Button.tsx',
 *     },
 *   ],
 *
 *   invalid: [
 *     // ❌ components에서 @/ 앨리어스로 store 직접 import
 *     {
 *       code: `import { useAuthStore } from '@/store/authStore';`,
 *       filename: '/project/src/components/Button.tsx',
 *       errors: [{ messageId: 'noStoreImport' }],
 *     },
 *     // ❌ app에서 @/ 앨리어스로 store 직접 import
 *     {
 *       code: `import { useAuthStore } from '@/store/authStore';`,
 *       filename: '/project/src/app/(tabs)/index.tsx',
 *       errors: [{ messageId: 'noStoreImport' }],
 *     },
 *     // ❌ components에서 상대 경로로 store import
 *     {
 *       code: `import { useAuthStore } from '../../store/authStore';`,
 *       filename: '/project/src/components/auth/LoginButton.tsx',
 *       errors: [{ messageId: 'noStoreImport' }],
 *     },
 *     // ❌ app에서 상대 경로로 store import
 *     {
 *       code: `import { cartStore } from '../../../store/cartStore';`,
 *       filename: '/project/src/app/(tabs)/cart/index.tsx',
 *       errors: [{ messageId: 'noStoreImport' }],
 *     },
 *     // ❌ components 하위 중첩 경로에서 store import
 *     {
 *       code: `import { usePaymentStore } from '@/store/paymentStore';`,
 *       filename: '/project/src/components/payment/PaymentCard.tsx',
 *       errors: [{ messageId: 'noStoreImport' }],
 *     },
 *     // ❌ 복수의 store import
 *     {
 *       code: `
 *         import { useAuthStore } from '@/store/authStore';
 *         import { useCartStore } from '@/store/cartStore';
 *       `,
 *       filename: '/project/src/components/Header.tsx',
 *       errors: [
 *         { messageId: 'noStoreImport' },
 *         { messageId: 'noStoreImport' },
 *       ],
 *     },
 *   ],
 * });
 */
