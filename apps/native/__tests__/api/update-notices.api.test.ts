import { NetworkError } from '@repo/shared/api/AppError';
import http from '@repo/shared/api/client';

import { fetchUpdateNotices } from '@/api/update-notices.api';

jest.mock('@repo/shared/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedHttpGet = jest.mocked(http.get);

describe('update notices API', () => {
  beforeEach(() => {
    mockedHttpGet.mockReset();
  });

  it('loads update notices from the authenticated server API without reordering them', async () => {
    const updates = [
      {
        id: 2,
        displayOrder: 2,
        title: '두 번째 업데이트',
        description: '두 번째 설명',
      },
      {
        id: 1,
        displayOrder: 1,
        title: '첫 번째 업데이트',
        description: '첫 번째 설명',
      },
    ];

    mockedHttpGet.mockResolvedValue({ updates });

    await expect(fetchUpdateNotices()).resolves.toEqual(updates);
    expect(mockedHttpGet).toHaveBeenCalledWith('/update-notices');
  });

  it.each([
    null,
    {},
    { updates: null },
    {
      updates: [
        {
          id: '1',
          displayOrder: 1,
          title: '잘못된 업데이트',
          description: 'id 타입이 올바르지 않다',
        },
      ],
    },
  ])('rejects an invalid update notices response: %p', async (response) => {
    mockedHttpGet.mockResolvedValue(response);

    await expect(fetchUpdateNotices()).rejects.toThrow(
      'Update notices API returned invalid metadata',
    );
  });

  it('propagates a server lookup failure', async () => {
    const networkError = new NetworkError(new Error('network unavailable'));

    mockedHttpGet.mockRejectedValue(networkError);

    await expect(fetchUpdateNotices()).rejects.toBe(networkError);
  });
});
