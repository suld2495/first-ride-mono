'use strict';

const path = require('path');

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTestFile(filename) {
  return (
    /(^|\/)__tests__\//.test(filename) ||
    /\.(test|spec)\.(ts|tsx)$/.test(filename)
  );
}

function getFeatureRoot(filename) {
  const normalized = normalizePath(filename);
  const match = normalized.match(/^(.*\/features\/[^/]+)(\/.*)?$/);
  return match ? match[1] : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'feature 외부 모듈 참조 시 상대경로 대신 절대경로(@/) 사용을 강제합니다.',
      recommended: false,
    },
    messages: {
      noRelativeOutsideFeature:
        "feature 외부 모듈은 상대경로 대신 절대경로(@/)를 사용하세요.\n (예: '@/components/ui/button')",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    const normalizedFilename = normalizePath(filename);
    if (!/\.(ts|tsx)$/.test(normalizedFilename)) return {};
    if (isTestFile(normalizedFilename)) return {};

    const currentFeatureRoot = getFeatureRoot(normalizedFilename);

    return {
      ImportDeclaration(node) {
        if (typeof node.source.value !== 'string') return;

        const source = node.source.value;
        if (!source.startsWith('../')) return;

        if (/^(\.\.\/){2,}/.test(source)) {
          context.report({ node, messageId: 'noRelativeOutsideFeature' });
          return;
        }

        if (!currentFeatureRoot) {
          context.report({ node, messageId: 'noRelativeOutsideFeature' });
          return;
        }

        const resolvedImport = normalizePath(
          path.resolve(path.dirname(normalizedFilename), source),
        );

        if (!resolvedImport.startsWith(currentFeatureRoot + '/')) {
          context.report({ node, messageId: 'noRelativeOutsideFeature' });
        }
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const rule = require('./no-relative-import-outside-feature');
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: require('@typescript-eslint/parser'),
//     parserOptions: { ecmaFeatures: { jsx: true } },
//   },
// });
// tester.run('no-relative-import-outside-feature', rule, {
//   valid: [{
//     filename: '/project/src/features/auth/hooks/use-auth.ts',
//     code: `import { authApi } from '../api/auth.api';`,
//   }],
//   invalid: [{
//     filename: '/project/src/features/auth/hooks/use-auth.ts',
//     code: `import { Button } from '../../components/ui/button';`,
//     errors: [{ messageId: 'noRelativeOutsideFeature' }],
//   }],
// });
