import axiosInstance from '@repo/shared/api';
import { fetchPendingConfirmationCount } from '@repo/shared/api/notification.api';
import MockAdapter from 'axios-mock-adapter';

describe('notification.api', () => {
  const mockAxios = new MockAdapter(axiosInstance);

  afterEach(() => {
    mockAxios.reset();
  });

  it('대기 중 인증 요청 수를 조회한다', async () => {
    mockAxios.onGet('/notifications/pending-confirmation-count').reply(200, {
      success: true,
      data: {
        pendingConfirmationCount: 3,
      },
    });

    await expect(fetchPendingConfirmationCount()).resolves.toBe(3);
  });
});
