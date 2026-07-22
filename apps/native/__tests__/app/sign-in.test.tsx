import { login as kakaoLogin, me as kakaoMe } from '@react-native-kakao/user';
import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { Platform, StyleSheet as RNStyleSheet } from 'react-native';

import { setAuthorization, setRefreshToken } from '@/api/token-storage.api';
import { usePendingAppleAuthStore } from '@/store/pending-apple-auth.store';
import { getDeviceId } from '@/utils/device-id';

import SignIn from '../../app/sign-in';
import { palette } from '../../theme/tokens';
import { render } from '../setup/test-utils';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
declare const mockShowToast: jest.Mock;
declare const mockAppleSignIn: jest.Mock;
declare const mockAppleIsAvailable: jest.Mock;
declare const mockAuthStore: {
  lastUserId: string | null;
  signIn: jest.Mock;
};

// setAuthorization, setRefreshToken mock
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
const mockedKakaoLogin = jest.mocked(kakaoLogin);
const mockedKakaoMe = jest.mocked(kakaoMe);

// useNotifications mock
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    pushToken: { data: 'mock-push-token' },
  }),
}));

// axios mock adapter
let mockAxios: MockAdapter;

describe('SignIn 페이지', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockShowToast.mockClear();
    mockAuthStore.lastUserId = null;
    mockAuthStore.signIn.mockClear();
    mockedSetAuthorization.mockClear();
    mockedSetRefreshToken.mockClear();
    mockedGetDeviceId.mockResolvedValue('installation-device-id');
    mockAppleSignIn.mockReset();
    mockAppleIsAvailable.mockReset();
    mockedKakaoLogin.mockReset();
    mockedKakaoMe.mockReset();
    mockAppleIsAvailable.mockImplementation(() => new Promise(() => {}));
    usePendingAppleAuthStore.getState().clearAttempt();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onPost('/auth/apple/nonce').reply(200, {
      data: {
        nonceId: 'apple-nonce-id',
        nonce: 'apple-nonce',
        expiresAt: '2099-07-19T12:05:00Z',
      },
    });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 버튼 찾기 헬퍼 함수 (제목이 아닌 버튼만 선택)
  const getSubmitButton = (getAllByText: (text: string) => any[]) => {
    const buttons = getAllByText('로그인');

    // 두 번째 요소가 버튼 (첫 번째는 제목)
    return buttons[1];
  };

  describe('유효성 검증 테스트', () => {
    const getButtonStyle = (button: any) =>
      RNStyleSheet.flatten(
        typeof button.props.style === 'function'
          ? button.props.style({ pressed: false })
          : button.props.style,
      );

    it('모든 필드가 비어있으면 로그인 버튼이 비활성화된다', () => {
      const { getByTestId, queryByText } = render(<SignIn />);

      const submitButton = getByTestId('sign-in-submit-button');

      fireEvent.press(submitButton);

      expect(submitButton.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
      expect(getButtonStyle(submitButton)).toEqual(
        expect.objectContaining({
          backgroundColor: palette.theme.gray[10],
          opacity: 1,
        }),
      );
      expect(queryByText('이메일을 입력해주세요.')).not.toBeOnTheScreen();
      expect(queryByText('비밀번호를 입력해주세요.')).not.toBeOnTheScreen();
    });

    it('마지막 로그인 아이디가 있으면 이메일 입력칸에 자동으로 채운다', () => {
      mockAuthStore.lastUserId = 'last@example.com';

      const { getByPlaceholderText } = render(<SignIn />);

      expect(getByPlaceholderText('이메일을 입력하세요')).toHaveProp(
        'value',
        'last@example.com',
      );
    });

    it('이메일만 입력하면 로그인 버튼은 비활성 상태를 유지한다', () => {
      const { getByPlaceholderText, getByTestId } = render(<SignIn />);

      const userIdInput = getByPlaceholderText('이메일을 입력하세요');

      fireEvent.changeText(userIdInput, 'testuser');

      const submitButton = getByTestId('sign-in-submit-button');

      expect(submitButton.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
    });

    it('비밀번호만 입력하면 로그인 버튼은 비활성 상태를 유지한다', () => {
      const { getByPlaceholderText, getByTestId } = render(<SignIn />);

      const passwordInput = getByPlaceholderText('비밀번호를 입력하세요');

      fireEvent.changeText(passwordInput, 'password123');

      const submitButton = getByTestId('sign-in-submit-button');

      expect(submitButton.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
    });

    it('이메일과 비밀번호를 모두 입력하면 로그인 버튼이 활성화된다', () => {
      const { getByPlaceholderText, getByTestId } = render(<SignIn />);

      fireEvent.changeText(
        getByPlaceholderText('이메일을 입력하세요'),
        'testuser',
      );
      fireEvent.changeText(
        getByPlaceholderText('비밀번호를 입력하세요'),
        'password123',
      );

      const submitButton = getByTestId('sign-in-submit-button');

      expect(submitButton.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: false }),
      );
    });

    it('에러 상태에서 필드를 수정하면 해당 에러가 사라진다', async () => {
      mockAxios.onPost('/auth/login').reply(400, {
        error: {
          message: '잘못 입력된 값입니다.',
          data: [{ field: 'userId', message: '이메일을 확인해주세요.' }],
        },
      });

      const { getByPlaceholderText, getByTestId, findByText, queryByText } =
        render(<SignIn />);

      fireEvent.changeText(
        getByPlaceholderText('이메일을 입력하세요'),
        'wrong@example.com',
      );
      fireEvent.changeText(
        getByPlaceholderText('비밀번호를 입력하세요'),
        'password123',
      );

      const submitButton = getByTestId('sign-in-submit-button');

      fireEvent.press(submitButton);

      expect(await findByText('이메일을 확인해주세요.')).toBeOnTheScreen();

      const userIdInput = getByPlaceholderText('이메일을 입력하세요');

      fireEvent.changeText(userIdInput, 'test@example.com');

      await waitFor(() => {
        expect(queryByText('이메일을 확인해주세요.')).not.toBeOnTheScreen();
      });
    });
  });

  describe('하단 링크', () => {
    it('이용약관과 개인정보 처리방침 모달로 이동한다', () => {
      const { getByText } = render(<SignIn />);

      fireEvent.press(getByText('이용약관'));
      fireEvent.press(getByText('개인정보 처리방침'));

      expect(mockPush).toHaveBeenCalledWith('/modal?type=policies');
      expect(mockPush).toHaveBeenCalledWith('/modal?type=privacy');
    });
  });

  describe('플랫폼별 소셜 로그인', () => {
    it('웹에서는 카카오 로그인 버튼을 노출하지 않는다', () => {
      const originalPlatform = Platform.OS;

      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'web',
      });

      try {
        const { queryByText } = render(<SignIn />);

        expect(queryByText('카카오로 로그인')).not.toBeOnTheScreen();
      } finally {
        Object.defineProperty(Platform, 'OS', {
          configurable: true,
          value: originalPlatform,
        });
      }
    });

    it('iOS에서 Apple 로그인을 노출하고 기존 사용자를 로그인시킨다', async () => {
      const originalPlatform = Platform.OS;

      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'ios',
      });
      mockAppleIsAvailable.mockResolvedValue(true);
      mockAppleSignIn.mockResolvedValue({
        user: 'apple-user-id',
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-authorization-code',
      });
      mockAxios.onPost('/auth/apple/check').reply(200, {
        data: {
          isNewUser: false,
          appleUserInfo: {
            appleId: 'apple-user-id',
            email: 'relay@privaterelay.appleid.com',
            nickname: '애플 사용자',
          },
        },
      });
      mockAxios.onPost('/auth/apple/login').reply(200, {
        data: {
          accessToken: 'service-access-token',
          refreshToken: 'service-refresh-token',
          userInfo: { userId: 'apple_user', nickname: '애플 사용자' },
        },
      });

      try {
        const { findByText } = render(<SignIn />);

        fireEvent.press(await findByText('Apple로 로그인'));

        await waitFor(() => {
          expect(mockAuthStore.signIn).toHaveBeenCalledWith({
            userId: 'apple_user',
            nickname: '애플 사용자',
          });
        });
        expect(mockAppleSignIn).toHaveBeenCalledWith({
          nonce: 'apple-nonce',
          requestedScopes: [1],
        });
        expect(JSON.parse(mockAxios.history.post[1]?.data ?? '{}')).toEqual({
          nonceId: 'apple-nonce-id',
          identityToken: 'apple-identity-token',
        });
        expect(JSON.parse(mockAxios.history.post[2]?.data ?? '{}')).toEqual({
          nonceId: 'apple-nonce-id',
          identityToken: 'apple-identity-token',
          authorizationCode: 'apple-authorization-code',
          pushToken: 'mock-push-token',
          deviceType: 'ios',
          deviceId: 'installation-device-id',
        });
      } finally {
        Object.defineProperty(Platform, 'OS', {
          configurable: true,
          value: originalPlatform,
        });
      }
    });

    it('신규 Apple 사용자의 credential을 임시 보관하고 가입 화면으로 이동한다', async () => {
      const originalPlatform = Platform.OS;

      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'ios',
      });
      mockAppleIsAvailable.mockResolvedValue(true);
      mockAppleSignIn.mockResolvedValue({
        user: 'apple-user-id',
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-authorization-code',
      });
      mockAxios.onPost('/auth/apple/check').reply(200, {
        data: {
          isNewUser: true,
          appleUserInfo: {
            appleId: 'apple-user-id',
            email: 'relay@privaterelay.appleid.com',
            nickname: null,
          },
        },
      });

      try {
        const { findByText } = render(<SignIn />);

        fireEvent.press(await findByText('Apple로 로그인'));

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/social-sign-up');
        });
        const pendingAttempt = usePendingAppleAuthStore.getState().attempt;

        expect(pendingAttempt).toMatchObject({
          provider: 'apple',
          credential: {
            provider: 'apple',
            nonceId: 'apple-nonce-id',
            identityToken: 'apple-identity-token',
            authorizationCode: 'apple-authorization-code',
            expiresAt: Date.parse('2099-07-19T12:05:00Z'),
          },
        });
        expect(pendingAttempt!.expiresAt).toBeGreaterThan(Date.now());
        expect(pendingAttempt!.expiresAt).toBeLessThanOrEqual(
          Date.now() + 5 * 60 * 1000,
        );
        expect(mockAxios.history.post).toHaveLength(2);
      } finally {
        Object.defineProperty(Platform, 'OS', {
          configurable: true,
          value: originalPlatform,
        });
      }
    });

    it('신규 카카오 사용자의 토큰은 라우터가 아닌 임시 인증 시도에만 보관한다', async () => {
      mockedKakaoLogin.mockResolvedValue({
        accessToken: 'kakao-access-token',
        accessTokenExpiresAt: 2_000_000_000,
      } as Awaited<ReturnType<typeof kakaoLogin>>);
      mockedKakaoMe.mockResolvedValue({ id: 12345 } as Awaited<
        ReturnType<typeof kakaoMe>
      >);
      mockAxios.onPost('/auth/kakao/check').reply(200, {
        data: {
          isNewUser: true,
          kakaoUserInfo: { userId: '12345', nickname: '카카오 사용자' },
        },
      });

      const { findByText } = render(<SignIn />);

      fireEvent.press(await findByText('카카오로 로그인'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/social-sign-up');
      });
      expect(mockPush).not.toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            accessToken: expect.any(String),
          }),
        }),
      );
      expect(usePendingAppleAuthStore.getState().attempt).toMatchObject({
        provider: 'kakao',
        credential: {
          provider: 'kakao',
          socialId: '12345',
          accessToken: 'kakao-access-token',
          expiresAt: 2_000_000_000_000,
        },
      });
    });

    it('Apple nonce 검증 실패는 서버 메시지로 안내한다', async () => {
      const originalPlatform = Platform.OS;

      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'ios',
      });
      mockAppleIsAvailable.mockResolvedValue(true);
      mockAppleSignIn.mockResolvedValue({
        user: 'apple-user-id',
        identityToken: 'apple-identity-token',
        authorizationCode: 'apple-authorization-code',
      });
      mockAxios.onPost('/auth/apple/check').reply(401, {
        error: {
          message: 'Apple 인증 정보가 유효하지 않거나 만료되었습니다.',
          data: [
            {
              field: 'nonceId',
              message: '유효하지 않은 nonce입니다.',
              rejected: '',
            },
          ],
        },
      });

      try {
        const { findByText } = render(<SignIn />);

        fireEvent.press(await findByText('Apple로 로그인'));

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Apple 인증 정보가 유효하지 않거나 만료되었습니다.',
            'error',
          );
        });
      } finally {
        Object.defineProperty(Platform, 'OS', {
          configurable: true,
          value: originalPlatform,
        });
      }
    });

    it('Apple 시스템 인증 취소는 오류 토스트로 표시하지 않는다', async () => {
      const originalPlatform = Platform.OS;

      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: 'ios',
      });
      mockAppleIsAvailable.mockResolvedValue(true);
      mockAppleSignIn.mockRejectedValue(
        Object.assign(new Error('취소됨'), { code: 'ERR_REQUEST_CANCELED' }),
      );

      try {
        const { findByText } = render(<SignIn />);

        fireEvent.press(await findByText('Apple로 로그인'));

        await waitFor(() => {
          expect(mockAppleSignIn).toHaveBeenCalledTimes(1);
        });
        expect(mockShowToast).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(Platform, 'OS', {
          configurable: true,
          value: originalPlatform,
        });
      }
    });
  });

  describe('API 통합 테스트', () => {
    // 폼 입력 헬퍼 함수
    const fillForm = (
      getByPlaceholderText: (text: string) => any,
      data: {
        userId: string;
        password: string;
      },
    ) => {
      fireEvent.changeText(
        getByPlaceholderText('이메일을 입력하세요'),
        data.userId,
      );

      fireEvent.changeText(
        getByPlaceholderText('비밀번호를 입력하세요'),
        data.password,
      );
    };

    describe('로그인 성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(200, {
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            userInfo: {
              userId: 'testuser',
              nickname: 'testnick',
            },
          },
        });
      });

      it('로그인 상태로 전환하고 화면 이동은 루트 레이아웃에 맡긴다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthStore.signIn).toHaveBeenCalledWith({
            userId: 'testuser',
            nickname: 'testnick',
          });
        });
        expect(mockPush).not.toHaveBeenCalledWith(
          '/(tabs)/(afterLogin)/(routine)',
        );
        expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual(
          expect.objectContaining({ deviceId: 'installation-device-id' }),
        );
      });

      it('토큰 저장을 완료한 뒤 로그인 상태로 전환한다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockAuthStore.signIn).toHaveBeenCalledWith({
            userId: 'testuser',
            nickname: 'testnick',
          });
        });

        const authorizationCallOrder =
          mockedSetAuthorization.mock.invocationCallOrder[0];
        const refreshTokenCallOrder =
          mockedSetRefreshToken.mock.invocationCallOrder[0];
        const signInCallOrder =
          mockAuthStore.signIn.mock.invocationCallOrder[0];

        expect(mockedSetAuthorization).toHaveBeenCalledWith(
          'mock-access-token',
        );
        expect(mockedSetRefreshToken).toHaveBeenCalledWith(
          'mock-refresh-token',
        );
        expect(authorizationCallOrder).toBeLessThan(signInCallOrder);
        expect(refreshTokenCallOrder).toBeLessThan(signInCallOrder);
      });
    });

    describe('아이디/비밀번호 불일치 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(400, {
          error: {
            message: '아이디 또는 비밀번호가 일치하지 않습니다.',
          },
        });
      });

      it('에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'wronguser',
          password: 'wrongpassword',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '아이디 또는 비밀번호가 일치하지 않습니다.',
            'error',
          );
        });
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(500, {
          error: {
            message: '서버 오류가 발생했습니다.',
          },
        });
      });

      it('기본 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '서버 오류가 발생했습니다.',
            'error',
          );
        });
      });
    });

    describe('로그인 시도 제한 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').reply(429, {
          error: {
            message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
          },
        });
      });

      it('메시지를 표시하고 로그인 버튼을 잠시 비활성화한다', async () => {
        const { getByPlaceholderText, getByTestId } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'wrongpassword',
        });

        fireEvent.press(getByTestId('sign-in-submit-button'));

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
            'error',
          );
          expect(
            getByTestId('sign-in-submit-button').props.accessibilityState,
          ).toEqual(expect.objectContaining({ disabled: true }));
        });
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').networkError();
      });

      it('기본 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '아이디/비밀번호 로그인에 실패했습니다. 다시 시도해주세요.',
            'error',
          );
        });
      });
    });

    describe('타임아웃 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/auth/login').timeout();
      });

      it('기본 에러 메시지가 표시된다', async () => {
        const { getByPlaceholderText, getAllByText } = render(<SignIn />);

        fillForm(getByPlaceholderText, {
          userId: 'testuser',
          password: 'password123',
        });

        const submitButton = getSubmitButton(getAllByText);

        fireEvent.press(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '아이디/비밀번호 로그인에 실패했습니다. 다시 시도해주세요.',
            'error',
          );
        });
      });
    });
  });
});
