'use strict';

const path = require('path');

const SETTINGS_KEY = 'local-rules/layers';

const DEFAULT_LAYER_PATTERNS = Object.freeze({
  ui: ['src/components/ui/**'],
  theme: ['src/theme/**'],
  components: ['src/components/**'],
  app: ['src/app/**'],
  api: ['src/services/**', 'src/features/*/api/**'],
  hooks: ['src/hooks/**', 'src/features/*/hooks/**'],
  store: ['src/store/**'],
  constants: ['src/constants/**'],
  utils: ['src/utils/**'],
  types: ['src/types/**'],
  featureComponents: ['src/features/*/components/**'],
});

const regexCache = new Map();

function normalizePath(value = '') {
  return value.replace(/\\/g, '/');
}

function getContextCwd(context) {
  return normalizePath(context.cwd ?? process.cwd());
}

function getProjectRelativePath(context, value) {
  const normalizedValue = normalizePath(value);

  if (!path.isAbsolute(normalizedValue)) {
    return normalizedValue.replace(/^\.?\//, '');
  }

  return normalizePath(path.relative(getContextCwd(context), normalizedValue));
}

function normalizePattern(pattern) {
  return normalizePath(pattern).replace(/^\.?\//, '').replace(/\/+$/, '');
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function globToRegExp(pattern, { allowAbsolutePrefix }) {
  const cacheKey = `${allowAbsolutePrefix ? 'abs' : 'rel'}:${pattern}`;
  const cached = regexCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const normalizedPattern = normalizePattern(pattern)
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '__SINGLE_STAR__');

  const regexBody = escapeRegExp(normalizedPattern)
    .replace(/__DOUBLE_STAR__/g, '.*')
    .replace(/__SINGLE_STAR__/g, '[^/]*');

  const source = allowAbsolutePrefix
    ? `(?:^|.*/)${regexBody}$`
    : `^${regexBody}$`;

  const compiled = new RegExp(source);
  regexCache.set(cacheKey, compiled);

  return compiled;
}

function getLayerPatterns(context) {
  const configured = context.settings?.[SETTINGS_KEY] ?? {};

  return {
    ...DEFAULT_LAYER_PATTERNS,
    ...configured,
  };
}

function matchesPatterns(value, patterns, { allowAbsolutePrefix = true } = {}) {
  const normalizedValue = normalizePath(value).replace(/\/+$/, '');

  return patterns.some((pattern) =>
    globToRegExp(pattern, { allowAbsolutePrefix }).test(normalizedValue),
  );
}

function relativeLayerPatterns(patterns) {
  return patterns.flatMap((pattern) => {
    const normalized = normalizePattern(pattern);
    const segments = normalized.split('/');
    const suffixPatterns = [];

    if (normalized.startsWith('src/')) {
      suffixPatterns.push(normalized.slice(4));
    }

    for (let index = 1; index < segments.length - 1; index += 1) {
      suffixPatterns.push(segments.slice(index).join('/'));
    }

    return [normalized, ...suffixPatterns];
  });
}

function isLayerFile(context, filename, layerName) {
  const patterns = getLayerPatterns(context)[layerName] ?? [];

  if (patterns.length === 0) {
    return false;
  }

  return matchesPatterns(getProjectRelativePath(context, filename), patterns, {
    allowAbsolutePrefix: false,
  });
}

function isLayerImportPath(context, importSource, layerName, currentFilename) {
  const patterns = getLayerPatterns(context)[layerName] ?? [];

  if (patterns.length === 0) {
    return false;
  }

  if (importSource.startsWith('.')) {
    const currentDir = path.dirname(normalizePath(currentFilename));
    const resolved = normalizePath(path.resolve(currentDir, importSource));

    return matchesPatterns(getProjectRelativePath(context, resolved), patterns, {
      allowAbsolutePrefix: false,
    });
  }

  if (importSource.startsWith('@/')) {
    return matchesPatterns(
      importSource.slice(2),
      relativeLayerPatterns(patterns),
      { allowAbsolutePrefix: false },
    );
  }

  return matchesPatterns(importSource, relativeLayerPatterns(patterns), {
    allowAbsolutePrefix: false,
  });
}

function isUiLayerFile(context, filename) {
  return isLayerFile(context, filename, 'ui');
}

function isThemeFile(context, filename) {
  return isLayerFile(context, filename, 'theme');
}

function isComponentFile(context, filename) {
  return isLayerFile(context, filename, 'components');
}

function isAppEntryFile(context, filename) {
  return isLayerFile(context, filename, 'app');
}

function isApiLayerFile(context, filename) {
  return isLayerFile(context, filename, 'api');
}

function isHooksFile(context, filename) {
  return isLayerFile(context, filename, 'hooks');
}

function isConstantsFile(context, filename) {
  return isLayerFile(context, filename, 'constants');
}

function isUtilsFile(context, filename) {
  return isLayerFile(context, filename, 'utils');
}

function isTypesFile(context, filename) {
  return isLayerFile(context, filename, 'types');
}

function isFeatureComponentFile(context, filename) {
  return isLayerFile(context, filename, 'featureComponents');
}

module.exports = {
  DEFAULT_LAYER_PATTERNS,
  SETTINGS_KEY,
  normalizePath,
  getLayerPatterns,
  isLayerFile,
  isLayerImportPath,
  isUiLayerFile,
  isThemeFile,
  isComponentFile,
  isAppEntryFile,
  isApiLayerFile,
  isHooksFile,
  isConstantsFile,
  isUtilsFile,
  isTypesFile,
  isFeatureComponentFile,
};
