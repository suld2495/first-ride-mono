import axiosInstance from '@repo/shared/api';
import {
  addFriend,
  fetchFriendProfile,
  fetchFriends,
  fetchRandomFriendRecommendation,
  fetchRandomFriendRecommendationSettings,
  sendFriendCheer,
  updateRandomFriendRecommendationSettings,
} from '@repo/shared/api/friend';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

const FRIEND_SINCE = '2026-05-21T08:28:25.407Z';

const friends = [
  {
    friendId: 1,
    nickname: 'yunji12345',
    mateNickname: 'mate1',
    job: '직장인',
    profileImage: null,
    level: 1,
    characterCode: 'MAGE_INTERMEDIATE',
    characterImageUrl: null,
    friendSince: FRIEND_SINCE,
  },
  {
    friendId: 2,
    nickname: 'hy',
    mateNickname: 'mate2',
    job: '직장인',
    profileImage: null,
    level: 2,
    characterCode: 'MAGE_INTERMEDIATE',
    characterImageUrl: null,
    friendSince: FRIEND_SINCE,
  },
  {
    friendId: 3,
    nickname: 'Fff',
    mateNickname: 'mate3',
    job: '직장인',
    profileImage: null,
    level: 3,
    characterCode: 'MAGE_INTERMEDIATE',
    characterImageUrl: null,
    friendSince: FRIEND_SINCE,
  },
];

describe('friend.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('fetchFriends', () => {
    beforeEach(() => {
      mockAxios.onGet('/friends').reply(200, { data: friends });
    });

    it('keyword가 있으면 nickname에 포함되는 친구만 반환한다', () => {
      return expect(fetchFriends({ page: 1, keyword: 'yun' })).resolves.toEqual(
        [
          expect.objectContaining({
            friendId: friends[0].friendId,
            nickname: friends[0].nickname,
          }),
        ],
      );
    });

    it('keyword와 일치하는 친구가 없으면 빈 배열을 반환한다', () => {
      return expect(
        fetchFriends({ page: 1, keyword: 'ㅇㅇㅇ' }),
      ).resolves.toEqual([]);
    });

    it('목록 응답의 friendId를 그대로 반환한다', async () => {
      await expect(fetchFriends({ page: 1, keyword: '' })).resolves.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ friendId: friends[0].friendId }),
          expect.objectContaining({ friendId: friends[1].friendId }),
          expect.objectContaining({ friendId: friends[2].friendId }),
        ]),
      );
      expect(mockAxios.history.get).toHaveLength(1);
    });

    it('목록 응답 필드가 비정상이어도 기본 친구 목록으로 정규화한다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet('/friends').reply(200, {
        data: [
          {
            friendId: null,
            nickname: null,
            motto: 1234,
            level: Number.NaN,
            characterImageUrl: 1234,
          },
        ],
      });

      await expect(fetchFriends({ page: 1, keyword: '' })).resolves.toEqual([
        expect.objectContaining({
          friendId: 'unknown-0',
          nickname: '친구 1',
          motto: null,
          mottos: [],
          level: 1,
          characterImageUrl: null,
        }),
      ]);
    });
  });

  describe('fetchFriendProfile', () => {
    it('친구 프로필을 friendId로 조회한다', async () => {
      const profile = {
        friendId: 9007199254740991,
        nickname: 'yunji12345',
        job: '마법사',
        motto: '오늘도 전진',
        level: 7,
        characterCode: 'MAGE_INTERMEDIATE',
        characterImageUrl: '/assets/characters/mage_intermediate.png',
        backgroundImageUrl: '/assets/backgrounds/mage.png',
      };

      mockAxios
        .onGet('/friends/9007199254740991/profile')
        .reply(200, { data: profile });

      await expect(fetchFriendProfile('9007199254740991')).resolves.toEqual(
        profile,
      );
    });
  });

  describe('fetchRandomFriendRecommendation', () => {
    it('body 없이 랜덤 친구 추천을 요청하고 추천 프로필을 반환한다', async () => {
      const recommendation = {
        nickname: '젤리',
        level: 6,
        job: '궁수',
        motto: '오늘도 한 걸음',
        characterCode: 'ARCHER_BEGINNER',
        characterImageUrl:
          'https://api.irura.uk/assets/characters/archer_beginner.png',
        backgroundImageUrl:
          'https://api.irura.uk/assets/backgrounds/archer_background.webp',
        recommendedDate: '2026-08-04',
        routines: [
          {
            routineName: '아침 산책',
            routineDetail: '30분 걷기',
            category: '운동',
            symbolColor: '#22CC88',
            routineCount: 3,
          },
        ],
      };

      mockAxios.onPost('/friends/random-recommendation').reply((config) => {
        expect(config.data).toBeUndefined();
        return [200, { data: recommendation }];
      });

      await expect(fetchRandomFriendRecommendation()).resolves.toEqual(
        recommendation,
      );
    });

    it('추천 후보가 없으면 서버 안내 메시지를 보존한다', async () => {
      mockAxios.onPost('/friends/random-recommendation').reply(400, {
        success: false,
        error: {
          message: '추천할 사용자가 없습니다.\n잠시 후 다시 시도해주세요.',
        },
      });

      await expect(fetchRandomFriendRecommendation()).rejects.toMatchObject({
        status: 400,
        message: '추천할 사용자가 없습니다.\n잠시 후 다시 시도해주세요.',
      });
    });
  });

  describe('randomFriendRecommendationSettings', () => {
    it('랜덤 친구 추천 노출 설정을 조회한다', async () => {
      mockAxios.onGet('/users/me/random-friend-settings').reply(200, {
        data: {
          randomFriendRecommendationEnabled: false,
        },
      });

      await expect(fetchRandomFriendRecommendationSettings()).resolves.toEqual({
        randomFriendRecommendationEnabled: false,
      });
    });

    it('랜덤 친구 추천 노출 설정 변경값을 PATCH body로 전송한다', async () => {
      mockAxios.onPatch('/users/me/random-friend-settings').reply((config) => {
        expect(JSON.parse(config.data ?? '{}')).toEqual({
          randomFriendRecommendationEnabled: false,
        });

        return [
          200,
          {
            data: {
              randomFriendRecommendationEnabled: false,
            },
          },
        ];
      });

      await expect(
        updateRandomFriendRecommendationSettings(false),
      ).resolves.toEqual({
        randomFriendRecommendationEnabled: false,
      });
    });
  });

  describe('sendFriendCheer', () => {
    it('friendId로 body 없이 응원 콕을 보내고 서버 응답을 반환한다', async () => {
      const cheer = {
        cheerId: 10,
        senderId: 1,
        senderNickname: '윤윤',
        receiverId: 2,
        receiverNickname: '맨날12',
        message: '윤윤님이 함께 모험을 떠나자고 합니다!',
        createdAt: '2026-07-29 14:10',
      };

      mockAxios.onPost('/friends/2/cheer').reply((config) => {
        expect(config.data).toBeUndefined();
        return [200, cheer];
      });

      await expect(sendFriendCheer(2)).resolves.toEqual(cheer);
    });

    it('1시간 제한 응답의 서버 메시지를 오류로 전달한다', async () => {
      mockAxios.onPost('/friends/2/cheer').reply(429, {
        success: false,
        error: {
          message:
            '같은 친구에게는 1시간에 한 번만 응원 콕을 보낼 수 있습니다.',
        },
      });

      await expect(sendFriendCheer(2)).rejects.toMatchObject({
        message: '같은 친구에게는 1시간에 한 번만 응원 콕을 보낼 수 있습니다.',
      });
    });
  });

  describe('addFriend', () => {
    const friendRequest = {
      id: 1,
      senderNickname: '윤윤',
      receiverNickname: '맨날12',
      status: 'PENDING' as const,
      createdAt: '2026-08-01T21:39:15',
    };

    it('201 direct 응답을 친구 요청으로 반환하고 receiverNickname을 전송한다', async () => {
      mockAxios.onPost('/friends/requests').reply((config) => {
        expect(config.data).toBe(
          JSON.stringify({ receiverNickname: '맨날12' }),
        );
        return [201, friendRequest];
      });

      await expect(addFriend('맨날12')).resolves.toEqual(friendRequest);
    });

    it('SERVER_BUSY_RETRY 에러 코드를 보존한다', async () => {
      mockAxios.onPost('/friends/requests').reply(429, {
        success: false,
        error: {
          message: '요청이 몰려 처리 중입니다.',
          code: 'SERVER_BUSY_RETRY',
        },
        timestamp: '2026-08-01T21:39:15',
        path: '/api/friends/requests',
      });

      await expect(addFriend('맨날12')).rejects.toMatchObject({
        code: 'SERVER_BUSY_RETRY',
        message: '요청이 몰려 처리 중입니다.',
      });
    });
  });
});
