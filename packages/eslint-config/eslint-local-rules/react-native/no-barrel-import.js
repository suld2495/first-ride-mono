'use strict';

const fs = require('fs');
const path = require('path');

const INDEX_FILE_NAMES = new Set(['index', 'index.ts', 'index.tsx']);
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

function normalizePath(filename) {
  return filename.replace(/\\/g, '/');
}

function isTargetFile(filename) {
  return /\.(ts|tsx)$/.test(normalizePath(filename));
}

function hasExplicitExtension(importSource) {
  return /\.[a-z0-9]+$/i.test(importSource);
}

function isExternalPackageImport(importSource) {
  return (
    !importSource.startsWith('@/') &&
    !importSource.startsWith('./') &&
    !importSource.startsWith('../') &&
    !importSource.startsWith('/')
  );
}

function isExplicitIndexImport(importSource) {
  const normalizedSource = importSource.replace(/\\/g, '/');
  const lastSegment = normalizedSource.split('/').pop();
  return Boolean(lastSegment && INDEX_FILE_NAMES.has(lastSegment));
}

function resolveImportBase(importSource, filename) {
  if (importSource.startsWith('@/')) {
    return path.resolve(process.cwd(), importSource.slice(2));
  }

  if (importSource.startsWith('./') || importSource.startsWith('../')) {
    return path.resolve(path.dirname(filename), importSource);
  }

  if (path.isAbsolute(importSource)) {
    return importSource;
  }

  return null;
}

function hasDirectFile(basePath) {
  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return true;
  }

  return FILE_EXTENSIONS.some((extension) => fs.existsSync(`${basePath}${extension}`));
}

function resolvesToIndexFile(basePath) {
  if (!fs.existsSync(basePath)) return false;
  if (!fs.statSync(basePath).isDirectory()) return false;

  return (
    fs.existsSync(path.join(basePath, 'index.ts')) ||
    fs.existsSync(path.join(basePath, 'index.tsx'))
  );
}

function isProjectRootEntry(filename) {
  const normalized = normalizePath(filename);
  return /\/index\.(ts|tsx)$/.test(normalized);
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Metro 성능을 위해 index.ts 경유 barrel import를 금지합니다.',
      recommended: false,
    },
    messages: {
      noBarrelImport:
        "barrel import(index.ts 경유)를 사용하지 마세요. Metro 번들러 성능에 불리합니다. 파일을 직접 import하세요. (예: '@/components/ui/button')",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(filename)) return {};

    return {
      ImportDeclaration(node) {
        const importSource = String(node.source.value ?? '');
        if (!importSource) return;
        if (isExternalPackageImport(importSource)) return;
        if (isProjectRootEntry(filename)) return;

        if (isExplicitIndexImport(importSource)) {
          context.report({
            node: node.source,
            messageId: 'noBarrelImport',
          });
          return;
        }

        if (hasExplicitExtension(importSource)) return;

        const resolvedBasePath = resolveImportBase(importSource, filename);
        if (!resolvedBasePath) return;
        if (hasDirectFile(resolvedBasePath)) return;
        if (!resolvesToIndexFile(resolvedBasePath)) return;

        context.report({
          node: node.source,
          messageId: 'noBarrelImport',
        });
      },
    };
  },
};

// RuleTester 예시
// const { RuleTester } = require('eslint');
// const tsParser = require('@typescript-eslint/parser');
// const rule = require('./no-barrel-import');
//
// const tester = new RuleTester({
//   languageOptions: {
//     ecmaVersion: 2022,
//     sourceType: 'module',
//     parser: tsParser,
//   },
// });
//
// tester.run('no-barrel-import', rule, {
//   valid: [
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: "import { Button } from '@/components/ui/button';",
//     },
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: "import { Button } from 'tamagui';",
//     },
//   ],
//   invalid: [
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: "import { Button } from '@/components/ui/index';",
//       errors: [{ messageId: 'noBarrelImport' }],
//     },
//     {
//       filename: '/project/src/features/auth/view.tsx',
//       code: "import { something } from '../components';",
//       errors: [{ messageId: 'noBarrelImport' }],
//     },
//   ],
// });
