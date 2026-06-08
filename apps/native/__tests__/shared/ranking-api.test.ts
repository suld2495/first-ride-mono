import axiosInstance from '@repo/shared/api';
import {
  fetchAllLevelRanking,
  fetchAllStatRankings,
  fetchFriendLevelRanking,
  fetchStatRanking,
} from '@repo/shared/api/ranking.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

describe('ranking.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('전체 레벨 랭킹을 topN query로 조회한다', async () => {
    const ranking = [
      {
        userId: 1,
        nickname: '첫번째',
        level: 12,
        totalExp: 450,
        rank: 1,
      },
    ];

    mockAxios.onGet('/ranking/level/all', { params: { topN: 50 } }).reply(200, {
      data: ranking,
    });

    await expect(fetchAllLevelRanking(50)).resolves.toEqual(ranking);
  });

  it('친구 레벨 랭킹을 조회한다', async () => {
    const ranking = [
      {
        userId: 7,
        nickname: '나',
        level: 8,
        totalExp: 240,
        rank: 1,
      },
    ];

    mockAxios.onGet('/ranking/level/friends').reply(200, {
      data: ranking,
    });

    await expect(fetchFriendLevelRanking()).resolves.toEqual(ranking);
  });

  it('특정 스탯 랭킹을 statType과 topN으로 조회한다', async () => {
    const ranking = [
      {
        userId: 3,
        nickname: '힘센 유저',
        statType: 'STRENGTH',
        value: 19,
        rank: 1,
      },
    ];

    mockAxios
      .onGet('/stats/ranking/STRENGTH', { params: { topN: 10 } })
      .reply(200, {
        data: ranking,
      });

    await expect(fetchStatRanking('STRENGTH', 10)).resolves.toEqual(ranking);
  });

  it('전체 스탯 랭킹을 topN으로 조회한다', async () => {
    const rankings = {
      STRENGTH: [
        {
          userId: 3,
          nickname: '힘센 유저',
          statType: 'STRENGTH',
          value: 19,
          rank: 1,
        },
      ],
    };

    mockAxios.onGet('/stats/ranking', { params: { topN: 10 } }).reply(200, {
      data: rankings,
    });

    await expect(fetchAllStatRankings(10)).resolves.toEqual(rankings);
  });
});
