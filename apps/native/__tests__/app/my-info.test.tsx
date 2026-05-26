import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { deletePushToken } from '@/api/push-token.api';
import { useAuthSignOut } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';

import MyInfo from '../../app/(tabs)/(afterLogin)/my-info';
import { render } from '../setup/test-utils';

declare global {
  var mockReplace: jest.Mock;
  var mockPush: jest.Mock;
}

jest.mock('@/api/push-token.api', () => ({
  deletePushToken: jest.fn(),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthSignOut: jest.fn(),
  useAuthUser: () => ({ nickname: 'testuser' }),
}));

jest.mock('@/hooks/useReceivedRequests', () => ({
  useReceivedRequests: () => ({ data: [] }),
}));

jest.mock('expo-router', () => {
  const React = require('react');

  return {
    useRouter: () => ({
      push: global.mockPush,
      replace: global.mockReplace,
    }),
    router: {
      replace: (...args: unknown[]) => global.mockReplace(...args),
    },
    Link: ({
      children,
      asChild,
      href,
    }: {
      children: React.ReactNode;
      asChild?: boolean;
      href: string;
    }) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          onPress: () => global.mockPush(href),
        });
      }

      return children;
    },
  };
});

describe('MyInfo 로그아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockPush = jest.fn();
    (useNotifications as jest.Mock).mockReturnValue({
      pushToken: { data: 'expo-push-token' },
    });
  });

  it('한마디 메뉴는 공통 모달 라우트로 이동한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByText } = render(<MyInfo />);

    fireEvent.press(getByText('한마디'));

    expect(global.mockPush).toHaveBeenCalledWith('/modal?type=account');
  });

  it('푸시 토큰 삭제가 실패해도 로그아웃을 진행한다', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    let confirmLogout: (() => void | Promise<void>) | undefined;

    (useAuthSignOut as jest.Mock).mockReturnValue(signOut);
    (deletePushToken as jest.Mock).mockRejectedValue(
      new Error('delete failed'),
    );
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        confirmLogout = buttons?.find(
          (button) => button.text === '로그아웃',
        )?.onPress;
      });

    const { getByText } = render(<MyInfo />);

    fireEvent.press(getByText('로그아웃'));

    await expect(confirmLogout?.()).resolves.toBeUndefined();

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledTimes(1);
      expect(global.mockReplace).toHaveBeenCalledWith('/sign-in');
    });
  });
});
