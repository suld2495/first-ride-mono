import fs from 'node:fs';
import path from 'node:path';

import appConfig from '../../app.config';

describe('Android keyboard layout', () => {
  it('uses pan mode for keyboard-aware Android forms', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    expect(config.android?.softwareKeyboardLayoutMode).toBe('pan');
  });

  it('adds Android keyboard clearance to the routine form', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '../../components/modal/routine-form-modal.tsx'),
      'utf8',
    );

    expect(source).toContain('extraHeight={');
    expect(source).toContain('Platform.OS === \'android\'');
    expect(source).toContain('ANDROID_FORM_KEYBOARD_EXTRA_HEIGHT');
  });
});
