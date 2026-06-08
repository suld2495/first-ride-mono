import axiosInstance from '@repo/shared/api';
import { distributeStats } from '@repo/shared/api/stat.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

describe('stat.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('distributeStats', () => {
    it('스탯 분배 요청을 API 스탯 키로 저장한다', async () => {
      const updatedStats = {
        userId: 71,
        nickname: '맨날12',
        currentLevel: 9,
        currentTotalExp: 249,
        currentLevelProgress: 9,
        expForNextLevel: 21,
        stats: {
          strength: 1,
          agility: 2,
          intelligence: 0,
          luck: 0,
          vitality: 0,
          mana: 0,
        },
        availablePoints: 21,
        totalPointsEarned: 24,
        totalPointsUsed: 3,
      };

      mockAxios.onPost('/stats/distribute').reply(200, {
        data: updatedStats,
      });

      await expect(
        distributeStats({
          distributions: {
            STRENGTH: 1,
            AGILITY: 2,
          },
        }),
      ).resolves.toEqual(updatedStats);

      expect(JSON.parse(mockAxios.history.post[0]?.data as string)).toEqual({
        distributions: {
          STRENGTH: 1,
          AGILITY: 2,
        },
      });
    });
  });
});
