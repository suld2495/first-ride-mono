import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import SocialSignUp from '../../app/social-sign-up';
import { render } from '../setup/test-utils';

declare const mockAuthStore: {
  signIn: jest.Mock;
};
declare const mockPush: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;

jest.mock('@/api/token-storage.api', () => ({
  setAuthorization: jest.fn(),
  setRefreshToken: jest.fn(),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    pushToken: { data: 'mock-push-token' },
  }),
}));

let mockAxios: MockAdapter;

describe('SocialSignUp 페이지', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockAuthStore.signIn.mockClear();
    for (const key of Object.keys(mockSearchParams)) {
      delete mockSearchParams[key];
    }
    mockSearchParams.provider = 'kakao';
    mockSearchParams.accessToken = 'kakao-access-token';
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet('/auth/job-options').reply(200, {
      data: [
        {
          jobName: '개발자',
          jobType: 'DEVELOPER',
          characterCode: 'dev',
          imageUrl: 'https://example.com/dev.png',
        },
      ],
    });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('추가 정보를 카카오 accessToken과 함께 제출한다', async () => {
    let signupRequest: unknown;

    mockAxios.onPost('/auth/kakao/signup').reply((config) => {
      signupRequest = JSON.parse(config.data as string);

      return [
        200,
        {
          data: {
            userInfo: { userId: 'testuser', nickname: '테스터' },
            accessToken: 'service-access-token',
            refreshToken: 'service-refresh-token',
          },
        },
      ];
    });

    const { getByPlaceholderText, getByText, findByText } = render(
      <SocialSignUp />,
    );

    fireEvent.changeText(
      getByPlaceholderText('닉네임을 입력해주세요.'),
      '테스터',
    );
    fireEvent.press(await findByText('개발자'));
    fireEvent.press(getByText('가입 완료'));

    await waitFor(() => {
      expect(signupRequest).toMatchObject({
        provider: 'kakao',
        accessToken: 'kakao-access-token',
        nickname: '테스터',
        job: '개발자',
        pushToken: 'mock-push-token',
      });
    });
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/(afterLogin)/(routine)');
  });
});
