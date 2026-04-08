'use strict';

const path = require('path');
const fs = require('fs');

/**
 * 주어진 디렉토리가 barrel export를 요구하는 대상인지 확인.
 * - src/components/
 * - src/hooks/
 * - src/utils/
 * - src/features/[featureName]/ (features 바로 아래 1단계)
 */
function isTargetDirectory(dir) {
  const normalized = dir.replace(/\\/g, '/');

  if (/\/src\/(components|hooks|utils)$/.test(normalized)) return true;

  // src/features/[featureName] — features 아래 정확히 1단계
  if (/\/src\/features\/[^/]+$/.test(normalized)) return true;

  return false;
}

function hasIndexFile(dir) {
  return fs.existsSync(path.join(dir, 'index.ts')) || fs.existsSync(path.join(dir, 'index.tsx'));
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '주요 디렉토리에 barrel export (index.ts)가 없으면 경고합니다.',
      recommended: false,
    },
    messages: {
      missingBarrel: '이 디렉토리에 index.ts 가 없습니다. barrel export 파일을 추가하세요.',
    },
    schema: [],
  },

  create(context) {
    return {
      Program(node) {
        const filename = context.filename ?? context.getFilename?.();
        if (!filename || filename === '<input>') return;

        const basename = path.basename(filename);
        // index.ts / index.tsx 자체는 제외
        if (basename === 'index.ts' || basename === 'index.tsx') return;

        const dir = path.dirname(filename);
        if (!isTargetDirectory(dir)) return;

        if (!hasIndexFile(dir)) {
          context.report({ node, messageId: 'missingBarrel' });
        }
      },
    };
  },
};

/*
  ─── 테스트 케이스 (RuleTester) ───────────────────────────────────────────

  // 참고: require-barrel-export는 fs.existsSync에 의존하므로
  // RuleTester로 직접 테스트하려면 fs를 mock해야 합니다.
  //
  // const { RuleTester } = require('eslint');
  // const rule = require('./require-barrel-export');
  //
  // 시나리오:
  // valid:
  //   - index.ts가 존재하는 src/components/ 내 파일
  //   - index.ts 파일 자체 (src/components/index.ts)
  //   - src/store/ 처럼 대상이 아닌 디렉토리의 파일
  //
  // invalid:
  //   - index.ts가 없는 src/components/ 내 파일
  //   - index.ts가 없는 src/features/auth/ 내 파일
  //
  // 통합 테스트 권장:
  //   임시 디렉토리를 만들어 파일 존재 여부를 실제로 제어하며 테스트.
*/
