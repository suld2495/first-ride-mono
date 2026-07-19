import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { setAuthorization, setRefreshToken } from '@/api/token-storage.api';
import { usePendingAppleAuthStore } from '@/store/pending-apple-auth.store';
import { getDeviceId } from '@/utils/device-id';

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

jest.mock('@/utils/device-id', () => ({
  getDeviceId: jest.fn(),
}));

const mockedSetAuthorization = jest.mocked(setAuthorization);
const mockedSetRefreshToken = jest.mocked(setRefreshToken);
const mockedGetDeviceId = jest.mocked(getDeviceId);

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
    mockedSetAuthorization.mockClear();
    mockedSetRefreshToken.mockClear();
    mockedGetDeviceId.mockResolvedValue('installation-device-id');
    for (const key of Object.keys(mockSearchParams)) {
      delete mockSearchParams[key];
    }
    mockSearchParams.provider = 'kakao';
    mockSearchParams.accessToken = 'kakao-access-token';
    usePendingAppleAuthStore.getState().clearCredential();
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
        deviceId: 'installation-device-id',
      });
    });
    expect(mockPush).not.toHaveBeenCalledWith('/(tabs)/(afterLogin)/(routine)');
  });

  it('토큰 저장을 완료한 뒤 로그인 상태로 전환한다', async () => {
    mockAxios.onPost('/auth/kakao/signup').reply(200, {
      data: {
        userInfo: { userId: 'testuser', nickname: '테스터' },
        accessToken: 'service-access-token',
        refreshToken: 'service-refresh-token',
      },
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
      expect(mockAuthStore.signIn).toHaveBeenCalledWith({
        userId: 'testuser',
        nickname: '테스터',
      });
    });

    const authorizationCallOrder =
      mockedSetAuthorization.mock.invocationCallOrder[0];
    const refreshTokenCallOrder =
      mockedSetRefreshToken.mock.invocationCallOrder[0];
    const signInCallOrder = mockAuthStore.signIn.mock.invocationCallOrder[0];

    expect(mockedSetAuthorization).toHaveBeenCalledWith('service-access-token');
    expect(mockedSetRefreshToken).toHaveBeenCalledWith('service-refresh-token');
    expect(authorizationCallOrder).toBeLessThan(signInCallOrder);
    expect(refreshTokenCallOrder).toBeLessThan(signInCallOrder);
  });

  it('Apple 신규 가입에는 임시 credential과 성별을 전송한다', async () => {
    mockSearchParams.provider = 'apple';
    delete mockSearchParams.accessToken;
    usePendingAppleAuthStore.getState().setCredential({
      provider: 'apple',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    });
    let signupRequest: unknown;

    mockAxios.onPost('/auth/apple/signup').reply((config) => {
      signupRequest = JSON.parse(config.data as string);

      return [
        201,
        {
          data: {
            userInfo: { userId: 'apple_user', nickname: '애플 사용자' },
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
      '애플 사용자',
    );
    fireEvent.press(await findByText('개발자'));
    fireEvent.press(getByText('여성'));
    fireEvent.press(getByText('가입 완료'));

    await waitFor(() => {
      expect(signupRequest).toEqual({
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-authorization-code',
        nickname: '애플 사용자',
        job: '개발자',
        gender: 'FEMALE',
        pushToken: 'mock-push-token',
        deviceType: 'ios',
        deviceId: 'installation-device-id',
      });
    });
    expect(usePendingAppleAuthStore.getState().credential).toBeNull();
  });

  it('Apple 신규 가입은 성별을 선택하기 전 제출하지 않는다', async () => {
    mockSearchParams.provider = 'apple';
    delete mockSearchParams.accessToken;
    usePendingAppleAuthStore.getState().setCredential({
      provider: 'apple',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    });
    mockAxios.onPost('/auth/apple/signup').reply(201, { data: {} });

    const { getByPlaceholderText, getByText, findByText } = render(
      <SocialSignUp />,
    );

    fireEvent.changeText(
      getByPlaceholderText('닉네임을 입력해주세요.'),
      '애플 사용자',
    );
    fireEvent.press(await findByText('개발자'));
    fireEvent.press(getByText('가입 완료'));

    expect(await findByText('성별을 선택해주세요.')).toBeOnTheScreen();
    expect(mockAxios.history.post).toHaveLength(0);
  });

  it('Apple signup 재시도에서는 1회성 authorizationCode를 다시 보내지 않는다', async () => {
    mockSearchParams.provider = 'apple';
    delete mockSearchParams.accessToken;
    usePendingAppleAuthStore.getState().setCredential({
      provider: 'apple',
      identityToken: 'apple-identity-token',
      authorizationCode: 'apple-authorization-code',
    });
    let requestCount = 0;

    mockAxios.onPost('/auth/apple/signup').reply(() => {
      requestCount += 1;

      if (requestCount === 1) {
        return [
          400,
          {
            error: { message: '이미 사용 중인 닉네임입니다.' },
          },
        ];
      }

      return [
        201,
        {
          data: {
            userInfo: { userId: 'apple_user', nickname: '애플 사용자' },
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
      '애플 사용자',
    );
    fireEvent.press(await findByText('개발자'));
    fireEvent.press(getByText('여성'));
    fireEvent.press(getByText('가입 완료'));

    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(1);
    });
    fireEvent.press(getByText('가입 완료'));

    await waitFor(() => {
      expect(mockAxios.history.post).toHaveLength(2);
    });
    expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toMatchObject({
      authorizationCode: 'apple-authorization-code',
    });
    expect(
      JSON.parse(mockAxios.history.post[1]?.data ?? '{}'),
    ).not.toHaveProperty('authorizationCode');
  });
});
