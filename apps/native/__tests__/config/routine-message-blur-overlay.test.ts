import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MESSAGE_BLUR_OVERLAY_PATH = resolve(
  __dirname,
  '../../assets/routine-message-blur-overlay.png',
);

describe('routine message blur overlay asset', () => {
  it('uses the approved organic text-smear image', () => {
    const asset = readFileSync(MESSAGE_BLUR_OVERLAY_PATH);
    const digest = createHash('sha256').update(asset).digest('hex');

    expect(digest).toBe(
      '15b0522f97804fc3b3b92adf0899e8120d6cb30c6f9ef86ea6c78a4bcf7f489d',
    );
  });
});
