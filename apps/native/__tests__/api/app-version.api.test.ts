import { NetworkError } from '@repo/shared/api/AppError';
import http from '@repo/shared/api/client';

import {
  TESTFLIGHT_UPDATE_URL,
  fetchRequiredAppVersion,
} from '@/api/app-version.api';

jest.mock('@repo/shared/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedHttpGet = jest.mocked(http.get);

describe('build number API', () => {
  beforeEach(() => {
    mockedHttpGet.mockReset();
  });

  it('loads the required build number from the authenticated server API', async () => {
    mockedHttpGet.mockResolvedValue({ buildNumber: '43' });

    await expect(fetchRequiredAppVersion()).resolves.toEqual({
      minimumBuildNumber: 43,
      updateUrl: TESTFLIGHT_UPDATE_URL,
    });
    expect(mockedHttpGet).toHaveBeenCalledWith('/build-number');
  });

  it.each(['', '0', '-1', '1.2.0', 'latest'])(
    'rejects an invalid server build number: %s',
    async (buildNumber) => {
      mockedHttpGet.mockResolvedValue({ buildNumber });

      await expect(fetchRequiredAppVersion()).rejects.toThrow(
        'Build number API returned invalid metadata',
      );
    },
  );

  it('propagates a server lookup failure', async () => {
    const networkError = new NetworkError(new Error('network unavailable'));

    mockedHttpGet.mockRejectedValue(networkError);

    await expect(fetchRequiredAppVersion()).rejects.toBe(networkError);
  });
});
