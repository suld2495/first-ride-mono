import axiosInstance from '@repo/shared/api';
import { updateMotto } from '@repo/shared/api/user.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

const updatedUser = {
  id: 70,
  userId: 'kakao_4688076479',
  nickname: '윤윤',
  motto: '오늘도 전진',
  mottos: ['오늘도 전진'],
  level: 8,
  job: '마법사',
  characterImageUrl: '/assets/characters/mage.png',
  backgroundImageUrl: '/assets/backgrounds/mage.png',
  role: 'USER',
} as const;

describe('user.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('한마디 수정 성공 시 래핑되지 않은 UserResponse를 반환한다', async () => {
    mockAxios.onPut('/users/me/motto').reply((config) => {
      expect(JSON.parse(config.data ?? '{}')).toEqual({
        motto: '오늘도 전진',
      });

      return [200, updatedUser];
    });

    await expect(updateMotto({ motto: '오늘도 전진' })).resolves.toEqual(
      updatedUser,
    );
  });
});
