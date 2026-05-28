import axiosInstance from '@repo/shared/api';
import { fetchFriends } from '@repo/shared/api/friend';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

const FRIEND_SINCE = '2026-05-21T08:28:25.407Z';

const friends = [
  {
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
        [friends[0]],
      );
    });

    it('keyword와 일치하는 친구가 없으면 빈 배열을 반환한다', () => {
      return expect(
        fetchFriends({ page: 1, keyword: 'ㅇㅇㅇ' }),
      ).resolves.toEqual([]);
    });

    it('친구의 로그인 아이디와 계정 식별자를 분리해서 반환한다', async () => {
      const friendWithoutAccountId = {
        ...friends[2],
        userId: 'Fff1234',
      };

      mockAxios.resetHandlers();
      mockAxios.onGet('/friends').reply(200, { data: [friendWithoutAccountId] });
      mockAxios.onGet('/users/search?nickname=Fff').reply(200, {
        data: [{ id: 49, userId: 'Fff1234', nickname: 'Fff' }],
      });

      await expect(fetchFriends({ page: 1, keyword: '' })).resolves.toEqual([
        {
          ...friendWithoutAccountId,
          accountId: 49,
        },
      ]);
    });
  });
});
