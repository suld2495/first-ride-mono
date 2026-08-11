import fs from 'node:fs';
import path from 'node:path';

const NATIVE_ROOT = path.resolve(__dirname, '../..');
const fullscreenModalConsumers = [
  'app/(tabs)/(afterLogin)/my-info.tsx',
  'components/friend/friend-add-modal.tsx',
  'components/modal/routine-proof-detail-modal.tsx',
  'components/modal/whats-new-modal.tsx',
  'components/ui/bottom-sheet/bottom-sheet.tsx',
  'components/ui/select.tsx',
] as const;

describe('Android full-screen modal backdrops', () => {
  it.each(fullscreenModalConsumers)(
    '%s uses the shared full-screen modal',
    (relativePath) => {
      const source = fs.readFileSync(
        path.join(NATIVE_ROOT, relativePath),
        'utf8',
      );

      expect(source).toContain('FullscreenModal');
      expect(source).not.toMatch(/<Modal[\s>]/);
    },
  );
});
