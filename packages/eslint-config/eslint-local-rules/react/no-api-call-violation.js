'use strict';

const path = require('path');

// ──────────────────────────────────────────────────────────────
// 헬퍼
// ──────────────────────────────────────────────────────────────

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

// store/common/** 또는 store/features/**
function isStoreFile(filename) {
  return /[/\\]store[/\\](common|features)[/\\]/.test(filename);
}

// features/[name]/hooks/**
function isFeatureHooksFile(filename) {
  return /[/\\]features[/\\][^/\\]+[/\\]hooks[/\\]/.test(filename);
}

// filename에서 feature명 추출
function extractFeatureFromFilename(filename) {
  const match = normalizePath(filename).match(/\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

// @/features/[name]/ 경로에서 feature명 추출
function extractFeatureFromAliasPath(importPath) {
  const match = importPath.match(/^@\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

// 상대경로를 절대경로로 변환 후 feature명 추출
function extractFeatureFromRelativePath(importPath, currentFilename) {
  const currentDir = path.dirname(normalizePath(currentFilename));
  const resolved = normalizePath(path.resolve(currentDir, importPath));
  const match = resolved.match(/\/src\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

// @/ 별칭 또는 상대경로가 services/ 를 가리키는지 확인
function isServicesImport(importPath, currentFilename) {
  if (/^@\/services(\/|$)/.test(importPath)) return true;
  if (/^services(\/|$)/.test(importPath)) return true;
  if (importPath.startsWith('.')) {
    const currentDir = path.dirname(normalizePath(currentFilename));
    const resolved = normalizePath(path.resolve(currentDir, importPath));
    return /\/services(\/|$)/.test(resolved);
  }
  return false;
}

// import가 features/*/api/ 경로인지 확인
function isFeatureApiImport(importPath, currentFilename) {
  if (/^@\/features\/[^/]+\/api(\/|$)/.test(importPath)) return true;
  if (importPath.startsWith('.')) {
    const currentDir = path.dirname(normalizePath(currentFilename));
    const resolved = normalizePath(path.resolve(currentDir, importPath));
    return /\/features\/[^/]+\/api(\/|$)/.test(resolved);
  }
  return false;
}

// ──────────────────────────────────────────────────────────────
// Rule 1: no-api-in-store
// ──────────────────────────────────────────────────────────────
const noApiInStore = {
  meta: {
    type: 'problem',
    docs: {
      description: 'store에서는 API를 호출할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noApiInStore:
        'store에서는 API를 호출할 수 없습니다.\n' +
        ' API 호출은 feature hooks 레이어에서만 허용됩니다.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isStoreFile(filename)) return {};

    function report(node) {
      context.report({ node, messageId: 'noApiInStore' });
    }

    return {
      // services 또는 features/*/api import 금지
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isServicesImport(source, filename) || isFeatureApiImport(source, filename)) {
          report(node);
        }
      },

      // fetch() / axios.* 직접 호출 금지
      CallExpression(node) {
        const { callee } = node;

        // fetch(...)
        if (callee.type === 'Identifier' && callee.name === 'fetch') {
          report(node);
          return;
        }

        // axios.get(...) / axios.post(...) 등
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'axios'
        ) {
          report(node);
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 2: no-cross-feature-api-import
// ──────────────────────────────────────────────────────────────
const noCrossFeatureApiImport = {
  meta: {
    type: 'problem',
    docs: {
      description: '다른 feature의 api를 직접 호출하지 마세요.',
      recommended: false,
    },
    messages: {
      noCrossFeatureApiImport:
        '다른 feature의 api를 직접 호출하지 마세요.\n' +
        ' 다른 feature의 기능이 필요하면 해당 feature의 hooks를 통해 접근하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isFeatureHooksFile(filename)) return {};

    const currentFeature = extractFeatureFromFilename(filename);
    if (!currentFeature) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        // feature api import인지 먼저 확인
        if (!isFeatureApiImport(source, filename)) return;

        // import가 가리키는 feature명 추출
        let importedFeature = null;
        if (source.startsWith('@/')) {
          importedFeature = extractFeatureFromAliasPath(source);
        } else if (source.startsWith('.')) {
          importedFeature = extractFeatureFromRelativePath(source, filename);
        }

        // 다른 feature의 api면 금지
        if (importedFeature && importedFeature !== currentFeature) {
          context.report({ node, messageId: 'noCrossFeatureApiImport' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 3: no-services-direct-import-in-feature-hooks
// ──────────────────────────────────────────────────────────────
const noServicesDirectImportInFeatureHooks = {
  meta: {
    type: 'problem',
    docs: {
      description: 'feature hooks 레이어에서 services를 직접 import하지 마세요.',
      recommended: false,
    },
    messages: {
      noServicesDirectImport:
        'feature hooks 레이어에서 services를 직접 import하지 마세요.\n' +
        ' 공통 hooks 레이어를 통해 접근하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isFeatureHooksFile(filename)) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isServicesImport(source, filename)) {
          context.report({ node, messageId: 'noServicesDirectImport' });
        }
      },
    };
  },
};

// hooks/** (전역 hooks, features 하위 아님)
function isGlobalHooksFile(filename) {
  return /[/\\]hooks[/\\]/.test(filename) && !/[/\\]features[/\\]/.test(filename);
}

// store/common/**
function isStoreCommonFile(filename) {
  return /[/\\]store[/\\]common[/\\]/.test(filename);
}

// store/features/**
function isStoreFeatureImport(importPath, currentFilename) {
  if (/^@\/store\/features(\/|$)/.test(importPath)) return true;
  if (/^store\/features(\/|$)/.test(importPath)) return true;
  if (importPath.startsWith('.')) {
    const currentDir = path.dirname(normalizePath(currentFilename));
    const resolved = normalizePath(path.resolve(currentDir, importPath));
    return /\/store\/features(\/|$)/.test(resolved);
  }
  return false;
}

// ──────────────────────────────────────────────────────────────
// Rule 4: no-store-features-in-hooks
// ──────────────────────────────────────────────────────────────
const noStoreFeaturesInHooks = {
  meta: {
    type: 'problem',
    docs: {
      description: '전역 hooks에서는 store/features를 직접 참조할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noStoreFeaturesInHooks:
        '전역 hooks 레이어에서는 store/features 를 직접 import할 수 없습니다.\n' +
        ' store/features 상태가 필요하면 store/common 을 통해 접근하세요.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isGlobalHooksFile(filename)) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isStoreFeatureImport(source, filename)) {
          context.report({ node, messageId: 'noStoreFeaturesInHooks' });
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 5: no-api-in-hooks
// ──────────────────────────────────────────────────────────────
const noApiInHooks = {
  meta: {
    type: 'problem',
    docs: {
      description: '전역 hooks에서는 API를 직접 호출할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noApiInHooks:
        '전역 hooks 레이어에서는 API를 직접 호출할 수 없습니다.\n' +
        ' API 호출은 feature hooks 레이어에서만 허용됩니다.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isGlobalHooksFile(filename)) return {};

    function report(node) {
      context.report({ node, messageId: 'noApiInHooks' });
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isServicesImport(source, filename) || isFeatureApiImport(source, filename)) {
          report(node);
        }
      },

      CallExpression(node) {
        const { callee } = node;

        if (callee.type === 'Identifier' && callee.name === 'fetch') {
          report(node);
          return;
        }

        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'axios'
        ) {
          report(node);
          return;
        }

        if (callee.type === 'Identifier' && callee.name === 'axios') {
          report(node);
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Rule 6: no-api-in-store-common
// ──────────────────────────────────────────────────────────────
const noApiInStoreCommon = {
  meta: {
    type: 'problem',
    docs: {
      description: 'store/common에서는 API를 호출할 수 없습니다.',
      recommended: false,
    },
    messages: {
      noApiInStoreCommon:
        'store/common 에서는 API를 호출할 수 없습니다.\n' +
        ' API 호출은 feature hooks 레이어에서만 허용됩니다.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!isStoreCommonFile(filename)) return {};

    function report(node) {
      context.report({ node, messageId: 'noApiInStoreCommon' });
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (isServicesImport(source, filename) || isFeatureApiImport(source, filename)) {
          report(node);
        }
      },

      CallExpression(node) {
        const { callee } = node;

        if (callee.type === 'Identifier' && callee.name === 'fetch') {
          report(node);
          return;
        }

        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'axios'
        ) {
          report(node);
          return;
        }

        if (callee.type === 'Identifier' && callee.name === 'axios') {
          report(node);
        }
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────
// Export
// ──────────────────────────────────────────────────────────────
module.exports = {
  rules: {
    'no-api-in-store': noApiInStore,
    'no-cross-feature-api-import': noCrossFeatureApiImport,
    'no-services-direct-import-in-feature-hooks': noServicesDirectImportInFeatureHooks,
    'no-store-features-in-hooks': noStoreFeaturesInHooks,
    'no-api-in-hooks': noApiInHooks,
    'no-api-in-store-common': noApiInStoreCommon,
  },
};
