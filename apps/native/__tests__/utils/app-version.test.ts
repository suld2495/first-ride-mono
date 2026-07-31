import { isVersionLower } from '@/utils/app-version';

describe('app version comparison', () => {
  it.each([
    ['1.0.0', '1.0.1'],
    ['1.9.9', '1.10.0'],
    ['1.0', '1.0.1'],
    ['v1.0.0', '1.1.0'],
  ])('%s is lower than %s', (currentVersion, latestVersion) => {
    expect(isVersionLower(currentVersion, latestVersion)).toBe(true);
  });

  it.each([
    ['1.0.0', '1.0.0'],
    ['1.0', '1.0.0'],
    ['1.10.0', '1.2.0'],
    ['2.0.0', '1.9.9'],
  ])('%s does not require %s', (currentVersion, latestVersion) => {
    expect(isVersionLower(currentVersion, latestVersion)).toBe(false);
  });

  it.each([
    ['', '1.0.0'],
    ['development', '1.0.0'],
    ['1.0.0', 'latest'],
  ])(
    'fails open when a version is invalid: %s / %s',
    (currentVersion, latestVersion) => {
      expect(isVersionLower(currentVersion, latestVersion)).toBe(false);
    },
  );
});
