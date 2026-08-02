import axiosInstance from '@repo/shared/api';
import { fetchFriendRoutines } from '@repo/shared/api/friend';
import { fetchRoutines } from '@repo/shared/api/routine.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

const pendingConfirmation = {
  confirmId: 781,
  date: '2026-08-02',
  status: 'WAIT' as const,
};

describe('routine api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('루틴 목록의 pendingConfirmations를 날짜 정보와 함께 반환한다', async () => {
    mockAxios.onGet('/routine/list?date=2026-08-02').reply(200, {
      data: [
        {
          routineId: 1,
          pendingConfirmations: [pendingConfirmation],
        },
      ],
    });

    await expect(fetchRoutines('2026-08-02')).resolves.toEqual([
      expect.objectContaining({
        pendingConfirmations: [pendingConfirmation],
      }),
    ]);
  });

  it('친구 루틴 목록의 pendingConfirmations를 루틴에 매핑한다', async () => {
    mockAxios.onGet('/friends/42/routines?date=2026-08-02').reply(200, {
      data: {
        friend: { nickname: '친구' },
        routines: [
          {
            routineId: 1,
            routineName: '친구 루틴',
            pendingConfirmations: [pendingConfirmation],
          },
        ],
      },
    });

    await expect(fetchFriendRoutines(42, '2026-08-02')).resolves.toEqual(
      expect.objectContaining({
        routines: [
          expect.objectContaining({
            pendingConfirmations: [pendingConfirmation],
          }),
        ],
      }),
    );
  });
});
