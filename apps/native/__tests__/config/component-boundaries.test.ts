import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve(__dirname, '../..');
const UI_COMPONENTS_ROOT = path.join(APP_ROOT, 'components/ui');
const DOMAIN_IMPORT_PATTERN =
  /from ['"]@\/components\/(quest|routine|friend|modal)\//;

const walk = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
};

describe('component boundaries', () => {
  it('공용 ui 컴포넌트는 도메인 컴포넌트를 직접 import하지 않는다', () => {
    const files = walk(UI_COMPONENTS_ROOT);

    const invalidImports = files.filter((file) => {
      const content = fs.readFileSync(file, 'utf8');

      return DOMAIN_IMPORT_PATTERN.test(content);
    });

    expect(invalidImports).toEqual([]);
  });
});
