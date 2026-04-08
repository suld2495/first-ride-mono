'use strict';

const { isAppEntryFile, normalizePath } = require('../path-groups');

const TARGET_IMPORTS = new Set([
  'router',
  'useRouter',
  'Link',
  'Redirect',
  'useLocalSearchParams',
  'useSegments',
]);

function isFeatureEntryFile(normalizedFilename) {
  if (!/\/features\/[^/]+\//.test(normalizedFilename)) {
    return false;
  }

  if (/\/features\/[^/]+\/[^/]+\.tsx$/.test(normalizedFilename)) {
    return true;
  }

  return /\/features\/[^/]+\/(?:.+\/)?[^/]+(?:screen|route|entry|container)\.tsx$/i.test(
    normalizedFilename,
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'expo-router 의 라우팅 API import를 app 라우트와 feature entry/container 파일로 제한합니다.',
      recommended: false,
    },
    schema: [],
    messages: {
      noRouterImportOutsideEntry:
        'expo-router 라우팅 API는 app 라우트 또는 feature entry/container 파일에서만 사용하세요.',
    },
  },

  create(context) {
    const filename =
      typeof context.filename === 'string' ? context.filename : context.getFilename();

    if (
      !filename ||
      filename === '<input>' ||
      isAppEntryFile(context, filename) ||
      isFeatureEntryFile(normalizePath(filename))
    ) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'expo-router') {
          return;
        }

        const hasRestrictedSpecifier = node.specifiers.some((specifier) => {
          if (specifier.type !== 'ImportSpecifier') {
            return false;
          }

          return TARGET_IMPORTS.has(specifier.imported.name);
        });

        if (hasRestrictedSpecifier) {
          context.report({ node, messageId: 'noRouterImportOutsideEntry' });
        }
      },
    };
  },
};
