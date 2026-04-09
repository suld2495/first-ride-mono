import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve(__dirname, '../..');
const FORBIDDEN_PACKAGE = ['react', 'native', 'unistyles'].join('-');

const walk = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (
      entry.name === 'node_modules' ||
      entry.name === '.expo' ||
      entry.name === '.tamagui' ||
      entry.name === 'dist'
    ) {
      return [];
    }

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
};

describe('스타일 패키지 제거 상태', () => {
  it('앱 코드와 테스트 코드에 제거된 스타일 패키지 import가 남아있지 않다', () => {
    const files = walk(APP_ROOT);

    const remaining = files.filter((file) => {
      const content = fs.readFileSync(file, 'utf8');
      return content.includes(FORBIDDEN_PACKAGE);
    });

    expect(remaining).toEqual([]);
  });
});
