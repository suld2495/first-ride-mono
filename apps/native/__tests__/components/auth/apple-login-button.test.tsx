import { waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { AppleLoginButton } from '@/components/auth/apple-login-button';

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

  it('로딩 중에는 버튼 입력을 차단한다', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });
    mockAppleIsAvailable.mockResolvedValue(true);
    const { findByLabelText, getByTestId } = render(
      <AppleLoginButton loading onPress={jest.fn()} />,
    );
    await findByLabelText('Apple로 로그인');
    const container = getByTestId('apple-login-button-container');

    expect(container.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    expect(container.props.pointerEvents).toBe('none');
  });
});
