'use strict';
const {
  isComponentFile,
  isFeatureComponentFile,
  isUiLayerFile,
} = require('../path-groups');

const DEFAULT_FORBIDDEN_PACKAGES = ['tamagui', '@tamagui/'];

function matchForbiddenPackage(importSource, forbiddenPackages) {
  for (const pkg of forbiddenPackages) {
    if (pkg.endsWith('/')) {
      if (importSource.startsWith(pkg)) return importSource;
      continue;
    }

    if (importSource === pkg || importSource.startsWith(pkg + '/')) {
      return importSource;
    }
  }

  return null;
}

function isAllowedFile(context, filename) {
  if (!filename || filename === '<input>') return false;
  return isUiLayerFile(context, filename);
}

function isTargetFile(context, filename) {
  if (!filename || filename === '<input>') return false;

  return (
    isComponentFile(context, filename) || isFeatureComponentFile(context, filename)
  );
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'src/components/ui 외부에서는 tamagui 및 @tamagui/* 직접 import를 금지합니다.',
      recommended: false,
    },
    messages: {
      noDirectUiImport:
        'src/components/ui 외부에서는 "{{packageName}}"를 직접 import할 수 없습니다.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isTargetFile(context, filename)) return {};
    if (isAllowedFile(context, filename)) return {};

    const [{ packages = [] } = {}] = context.options;
    const forbiddenPackages = [...DEFAULT_FORBIDDEN_PACKAGES, ...packages];

    return {
      ImportDeclaration(node) {
        if (typeof node.source.value !== 'string') return;

        const matchedPackage = matchForbiddenPackage(
          node.source.value,
          forbiddenPackages,
        );

        if (!matchedPackage) return;

        context.report({
          node,
          messageId: 'noDirectUiImport',
          data: { packageName: matchedPackage },
        });
      },
    };
  },
};
