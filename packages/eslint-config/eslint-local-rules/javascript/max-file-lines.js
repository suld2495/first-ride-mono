'use strict';

const path = require('path');

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

/**
 * 간단한 glob 패턴 → RegExp 변환.
 *   **  →  .* (슬래시 포함 모든 문자)
 *   *   →  [^/]* (슬래시 제외)
 *   ?   →  [^/]  (슬래시 제외 단일 문자)
 * 나머지 정규표현식 특수문자는 이스케이프.
 */
function globToRegex(glob) {
  const norm = normalizePath(glob);
  let pattern = '';
  let i = 0;
  while (i < norm.length) {
    const ch = norm[i];
    if (ch === '*' && norm[i + 1] === '*') {
      pattern += '.*';
      i += 2;
      // ** 뒤 슬래시 흡수 (src/**/*.ts 의 / 처리)
      if (norm[i] === '/') i++;
    } else if (ch === '*') {
      pattern += '[^/]*';
      i++;
    } else if (ch === '?') {
      pattern += '[^/]';
      i++;
    } else if ('.+^${}()|[]\\'.includes(ch)) {
      pattern += '\\' + ch;
      i++;
    } else {
      pattern += ch;
      i++;
    }
  }
  return new RegExp(pattern);
}

/**
 * 파일 종류별 최대 라인 수 기본값.
 * 배열 순서 = 우선순위 (앞쪽이 더 구체적인 패턴).
 */
const DEFAULT_LIMITS = [
  // ui 컴포넌트 (components/ui 가 components 보다 구체적)
  { pattern: /\/src\/components\/ui\/.*\.tsx$/, max: 200 },
  // 공통 컴포넌트
  { pattern: /\/src\/components\/.*\.tsx$/, max: 250 },
  // feature 내부 컴포넌트
  { pattern: /\/src\/features\/.*\/components\/.*\.tsx$/, max: 250 },
  // feature 훅
  { pattern: /\/src\/features\/.*\/hooks\/.*\.ts$/, max: 200 },
  // 공통 훅
  { pattern: /\/src\/hooks\/.*\.ts$/, max: 200 },
  // feature api
  { pattern: /\/src\/features\/.*\/api\/.*\.ts$/, max: 150 },
  // services
  { pattern: /\/src\/services\/.*\.ts$/, max: 150 },
  // store
  { pattern: /\/src\/store\/.*\.ts$/, max: 150 },
  // utils
  { pattern: /\/src\/utils\/.*\.ts$/, max: 100 },
  // 그 외 src/**
  { pattern: /\/src\/.*\.(ts|tsx)$/, max: 250 },
];

/** 검사 대상에서 제외할 파일인지 확인 */
function shouldExclude(filename) {
  const base = path.basename(filename);
  return (
    base === 'index.ts' ||
    base === 'index.tsx' ||
    base === 'types.ts' ||
    /\.generated\.(ts|tsx)$/.test(base) ||
    /\.g\.(ts|tsx)$/.test(base)
  );
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '파일이 너무 길어지는 것을 방지합니다. 파일을 분리하는 것을 고려하세요.',
      recommended: false,
    },
    messages: {
      tooManyLines:
        '이 파일은 {{lineCount}}줄입니다. 최대 {{maxLines}}줄을 초과했습니다.\n' +
        ' 파일을 분리하는 것을 고려하세요.',
    },
    schema: [
      {
        type: 'object',
        description: '경로 패턴별 최대 라인 수 재정의 (glob 패턴을 키로 사용)',
        additionalProperties: { type: 'integer', minimum: 1 },
      },
    ],
  },

  create(context) {
    const filename = context.filename ?? context.getFilename?.() ?? '';
    if (!filename || filename === '<input>') return {};

    const norm = normalizePath(filename);
    if (shouldExclude(norm)) return {};

    // 사용자 override 처리
    const overrides = context.options[0] ?? {};
    const overrideLimits = Object.entries(overrides).map(([glob, max]) => ({
      pattern: globToRegex(glob),
      max,
    }));

    function getLimit(filepath) {
      // override 가 기본값보다 우선
      for (const { pattern, max } of overrideLimits) {
        if (pattern.test(filepath)) return max;
      }
      for (const { pattern, max } of DEFAULT_LIMITS) {
        if (pattern.test(filepath)) return max;
      }
      return null; // 해당 파일에 적용되는 제한 없음
    }

    return {
      Program(node) {
        const limit = getLimit(norm);
        if (limit === null) return;

        const sourceCode = context.sourceCode ?? context.getSourceCode?.();
        const lineCount = sourceCode.lines.length;

        if (lineCount > limit) {
          context.report({
            node,
            messageId: 'tooManyLines',
            data: { lineCount, maxLines: limit },
          });
        }
      },
    };
  },
};
