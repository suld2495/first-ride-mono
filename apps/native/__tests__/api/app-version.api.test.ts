import {
  TESTFLIGHT_UPDATE_URL,
  VERSION_CONFIG_URL,
  fetchRequiredAppVersion,
} from '@/api/app-version.api';

jest.mock('expo/fetch', () => ({
  fetch: jest.fn(),
}));

const createResponse = (
  body: unknown,
  options: { ok?: boolean; status?: number } = {},
) =>
  ({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

describe('app version config API', () => {
  it('loads the minimum version and official TestFlight update URL', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      createResponse({
        minimumVersion: '1.2.0',
        updateUrl: TESTFLIGHT_UPDATE_URL,
      }),
    );

    await expect(fetchRequiredAppVersion(fetcher)).resolves.toEqual({
      minimumVersion: '1.2.0',
      updateUrl: TESTFLIGHT_UPDATE_URL,
    });
    expect(fetcher).toHaveBeenCalledWith(
      VERSION_CONFIG_URL,
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
      }),
    );
  });

  it('rejects failed HTTP responses', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValue(createResponse({}, { ok: false, status: 503 }));

    await expect(fetchRequiredAppVersion(fetcher)).rejects.toThrow(
      'App version config failed with HTTP 503',
    );
  });

  it.each([
    [{ updateUrl: TESTFLIGHT_UPDATE_URL }],
    [{ minimumVersion: '1.2.0' }],
    [
      {
        minimumVersion: '1.2.0',
        updateUrl: 'https://example.com/not-testflight',
      },
    ],
  ])('rejects malformed version metadata: %p', async (body) => {
    const fetcher = jest.fn().mockResolvedValue(createResponse(body));

    await expect(fetchRequiredAppVersion(fetcher)).rejects.toThrow(
      'App version config returned invalid metadata',
    );
  });
});
