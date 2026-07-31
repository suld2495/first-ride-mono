import {
  APP_STORE_ID,
  fetchLatestAppStoreVersion,
} from '@/api/app-store-version.api';

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

describe('App Store version API', () => {
  it('looks up the Korean App Store entry and returns update metadata', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      createResponse({
        resultCount: 1,
        results: [
          {
            version: '1.2.0',
            trackViewUrl: `https://apps.apple.com/kr/app/id${APP_STORE_ID}`,
          },
        ],
      }),
    );

    await expect(fetchLatestAppStoreVersion(fetcher)).resolves.toEqual({
      version: '1.2.0',
      storeUrl: `https://apps.apple.com/kr/app/id${APP_STORE_ID}`,
    });
    expect(fetcher).toHaveBeenCalledWith(
      `https://itunes.apple.com/lookup?id=${APP_STORE_ID}&country=kr`,
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    );
  });

  it('returns null before the app is available in the store', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValue(createResponse({ resultCount: 0, results: [] }));

    await expect(fetchLatestAppStoreVersion(fetcher)).resolves.toBeNull();
  });

  it('rejects failed HTTP responses', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValue(createResponse({}, { ok: false, status: 503 }));

    await expect(fetchLatestAppStoreVersion(fetcher)).rejects.toThrow(
      'App Store lookup failed with HTTP 503',
    );
  });

  it('rejects malformed store metadata', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      createResponse({
        resultCount: 1,
        results: [{ version: '1.2.0' }],
      }),
    );

    await expect(fetchLatestAppStoreVersion(fetcher)).rejects.toThrow(
      'App Store lookup returned invalid metadata',
    );
  });
});
