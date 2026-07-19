import { waitFor } from '@testing-library/react-native';
import { Platform, StyleSheet as RNStyleSheet } from 'react-native';

import { AppleLoginButton } from '@/components/auth/apple-login-button';
import { KakaoLoginButton } from '@/components/auth/kakao-login-button';

import { render } from '../../setup/test-utils';

declare const mockAppleIsAvailable: jest.Mock;

describe('AppleLoginButton', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
    mockAppleIsAvailable.mockReset();
  });

  it('iOS가 아니면 Apple 지원 여부를 조회하지 않고 숨긴다', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'android',
    });

    const { queryByText } = render(<AppleLoginButton onPress={jest.fn()} />);

    expect(queryByText('Apple로 로그인')).not.toBeOnTheScreen();
    expect(mockAppleIsAvailable).not.toHaveBeenCalled();
  });

  it('Apple 지원 여부 조회가 실패하면 버튼을 숨긴다', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });
    mockAppleIsAvailable.mockRejectedValue(new Error('availability failed'));

    const { queryByText } = render(<AppleLoginButton onPress={jest.fn()} />);

    await waitFor(() => {
      expect(mockAppleIsAvailable).toHaveBeenCalledTimes(1);
    });
    expect(queryByText('Apple로 로그인')).not.toBeOnTheScreen();
  });

  it('카카오 로그인과 같은 크기와 정렬의 한국어 버튼을 표시한다', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });
    mockAppleIsAvailable.mockResolvedValue(true);

    const apple = render(<AppleLoginButton onPress={jest.fn()} />);
    const kakao = render(<KakaoLoginButton onPress={jest.fn()} />);

    const appleButton = await apple.findByTestId('apple-login-button');
    const kakaoButton = kakao.getByLabelText('카카오로 로그인');
    const getButtonStyle = (button: typeof appleButton) =>
      RNStyleSheet.flatten(button.props.style({ pressed: false }));

    expect(apple.getByText('Apple로 로그인')).toBeOnTheScreen();
    expect(apple.getByTestId('apple-login-logo')).toBeOnTheScreen();
    expect(
      apple.queryByTestId('native-apple-authentication-button'),
    ).not.toBeOnTheScreen();
    expect(getButtonStyle(appleButton)).toEqual(
      expect.objectContaining({
        height: getButtonStyle(kakaoButton).height,
        borderRadius: getButtonStyle(kakaoButton).borderRadius,
        shadowOpacity: getButtonStyle(kakaoButton).shadowOpacity,
        elevation: getButtonStyle(kakaoButton).elevation,
      }),
    );
  });

  it('로딩 중에는 버튼 입력을 차단한다', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });
    mockAppleIsAvailable.mockResolvedValue(true);
    const { findByTestId } = render(
      <AppleLoginButton loading onPress={jest.fn()} />,
    );
    const button = await findByTestId('apple-login-button');

    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });
});
