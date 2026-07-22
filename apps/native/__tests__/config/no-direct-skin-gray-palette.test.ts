import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve(__dirname, '../..');
const ALLOWED_FILES = new Set([
  path.join(APP_ROOT, 'theme/themes/common.ts'),
  path.join(APP_ROOT, 'theme/themes/theme.contract.ts'),
]);
const IGNORED_DIRS = new Set([
  'node_modules',
  '.expo',
  '.tamagui',
  'dist',
  '__tests__',
]);
const IGNORED_FILES = new Set([
  path.join(APP_ROOT, 'theme/themes/dark.ts'),
  path.join(APP_ROOT, 'theme/themes/light.ts'),
]);
const DIRECT_SKIN_GRAY_PATTERN = /palette\.theme\.gray\[(70|90)\]/;

const walk = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (IGNORED_DIRS.has(entry.name)) {
      return [];
    }

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
};

describe('skin gray palette usage', () => {
  it('gray 70/90 색상은 공통 테마 토큰으로만 직접 지정한다', () => {
    const invalidFiles = walk(APP_ROOT).filter((file) => {
      if (ALLOWED_FILES.has(file)) {
        return false;
      }

      if (IGNORED_FILES.has(file)) {
        return false;
      }

      return DIRECT_SKIN_GRAY_PATTERN.test(fs.readFileSync(file, 'utf8'));
    });

    expect(invalidFiles).toEqual([]);
  });
});
