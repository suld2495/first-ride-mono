import { isBuildNumberLower } from '@/utils/app-version';

describe('app build number comparison', () => {
  it.each([
    ['1', 2],
    ['42', 43],
    ['999', 1000],
  ])('%s is lower than %s', (currentBuildNumber, minimumBuildNumber) => {
    expect(isBuildNumberLower(currentBuildNumber, minimumBuildNumber)).toBe(
      true,
    );
  });

  it.each([
    ['43', 43],
    ['44', 43],
    ['1000', 999],
  ])('%s does not require %s', (currentBuildNumber, minimumBuildNumber) => {
    expect(isBuildNumberLower(currentBuildNumber, minimumBuildNumber)).toBe(
      false,
    );
  });

  it.each(['', 'development', '1.0.0', '-1'])(
    'fails open when an installed build number is invalid: %s',
    (currentBuildNumber) => {
      expect(isBuildNumberLower(currentBuildNumber, 43)).toBe(false);
    },
  );
});
