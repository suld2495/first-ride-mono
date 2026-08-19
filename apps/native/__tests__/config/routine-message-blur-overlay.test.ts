import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MESSAGE_BLUR_OVERLAY_PATH = resolve(
  __dirname,
  '../../assets/routine-message-blur-overlay.png',
);
const REPLY_MESSAGE_BLUR_OVERLAY_PATH = resolve(
  __dirname,
  '../../assets/routine-message-blur-overlay-reply.png',
);

describe('routine message blur overlay asset', () => {
  it('uses the approved organic text-smear image', () => {
    const asset = readFileSync(MESSAGE_BLUR_OVERLAY_PATH);
    const digest = createHash('sha256').update(asset).digest('hex');

    expect(digest).toBe(
      '15b0522f97804fc3b3b92adf0899e8120d6cb30c6f9ef86ea6c78a4bcf7f489d',
    );
  });

  it('uses a distinct organic text-smear image for the reply', () => {
    const requestAsset = readFileSync(MESSAGE_BLUR_OVERLAY_PATH);
    const replyAsset = readFileSync(REPLY_MESSAGE_BLUR_OVERLAY_PATH);
    const requestDigest = createHash('sha256')
      .update(requestAsset)
      .digest('hex');
    const replyDigest = createHash('sha256').update(replyAsset).digest('hex');

    expect(replyDigest).not.toBe(
      '0d1272f8fbd1cfe471b3c2a0395e88904434f4a8b3da2961d195e1666a78d62a',
    );
    expect(replyDigest).not.toBe(requestDigest);
  });
});
