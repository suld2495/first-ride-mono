import axiosInstance from '@repo/shared/api';
import { fetchFriendRoutines } from '@repo/shared/api/friend';
import {
  fetchMonthlyRoutines,
  fetchRoutines,
} from '@repo/shared/api/routine.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

const confirmation = {
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

  it('루틴 목록의 confirmations를 날짜 정보와 함께 반환한다', async () => {
    mockAxios.onGet('/routine/list?date=2026-08-02').reply(200, {
      data: [
        {
          routineId: 1,
          confirmations: [confirmation],
        },
      ],
    });

    await expect(fetchRoutines('2026-08-02')).resolves.toEqual([
      expect.objectContaining({
        confirmations: [confirmation],
      }),
    ]);
  });

  it('친구 루틴 목록의 confirmations를 루틴에 매핑한다', async () => {
    mockAxios.onGet('/friends/42/routines?date=2026-08-02').reply(200, {
      data: {
        isFriend: false,
        friend: { nickname: '친구' },
        routines: [
          {
            routineId: 1,
            routineName: '친구 루틴',
            confirmations: [confirmation],
          },
        ],
      },
    });

    await expect(fetchFriendRoutines(42, '2026-08-02')).resolves.toEqual(
      expect.objectContaining({
        isFriend: false,
        routines: [
          expect.objectContaining({
            confirmations: [confirmation],
          }),
        ],
      }),
    );
  });

  it('친구 루틴 목록의 친구 정보에 있는 friend 값을 isFriend로 정규화한다', async () => {
    mockAxios.onGet('/friends/42/routines?date=2026-08-02').reply(200, {
      data: {
        friend: { nickname: '친구', friend: true },
        routines: [],
      },
    });

    await expect(fetchFriendRoutines(42, '2026-08-02')).resolves.toEqual(
      expect.objectContaining({ isFriend: true }),
    );
  });

  it('친구 루틴 목록의 photoRequired를 루틴에 매핑한다', async () => {
    mockAxios.onGet('/friends/42/routines?date=2026-08-02').reply(200, {
      data: {
        friend: { nickname: '친구' },
        routines: [
          {
            routineId: 1,
            routineName: '친구 루틴',
            photoRequired: true,
          },
        ],
      },
    });

    await expect(fetchFriendRoutines(42, '2026-08-02')).resolves.toEqual(
      expect.objectContaining({
        routines: [
          expect.objectContaining({
            photoRequired: true,
          }),
        ],
      }),
    );
  });

  it('월간 루틴 목록의 photoRequired를 정규화한다', async () => {
    mockAxios
      .onGet('/routine/list/monthly', {
        params: { year: 2026, month: 8 },
      })
      .reply(200, {
        data: {
          year: 2026,
          month: 8,
          routines: [
            {
              routineId: 1,
              routineName: '월간 루틴',
              photoRequired: true,
            },
          ],
        },
      });

    await expect(
      fetchMonthlyRoutines({ year: 2026, month: 8 }),
    ).resolves.toEqual(
      expect.objectContaining({
        routines: [
          expect.objectContaining({
            photoRequired: true,
          }),
        ],
      }),
    );
  });
});
