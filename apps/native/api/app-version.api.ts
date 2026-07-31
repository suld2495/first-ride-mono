import http from '@repo/shared/api/client';

export const TESTFLIGHT_UPDATE_URL =
  'https://testflight.apple.com/join/qasZjjWJ';

const BUILD_NUMBER_ENDPOINT = '/build-number';
const BUILD_NUMBER_PATTERN = /^\d+$/;

interface BuildNumberResponse {
  buildNumber: string;
}

export interface RequiredAppVersion {
  minimumBuildNumber: number;
  updateUrl: string;
}

const parseBuildNumber = (buildNumber: unknown): number | null => {
  if (
    typeof buildNumber !== 'string' ||
    !BUILD_NUMBER_PATTERN.test(buildNumber)
  ) {
    return null;
  }

  const parsedBuildNumber = Number(buildNumber);

  return Number.isSafeInteger(parsedBuildNumber) && parsedBuildNumber > 0
    ? parsedBuildNumber
    : null;
};

export const fetchRequiredAppVersion = (): Promise<RequiredAppVersion> =>
  http
    .get<BuildNumberResponse, never>(BUILD_NUMBER_ENDPOINT)
    .then((response) => {
      const minimumBuildNumber = parseBuildNumber(response.buildNumber);

      if (minimumBuildNumber === null) {
        throw new Error('Build number API returned invalid metadata');
      }

      return {
        minimumBuildNumber,
        updateUrl: TESTFLIGHT_UPDATE_URL,
      };
    });
