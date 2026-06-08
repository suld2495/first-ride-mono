import { useMyStatsQuery } from '@repo/shared/hooks/useStat';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, StyleSheet } from 'react-native';

import { deletePushToken } from '@/api/push-token.api';
import { useAuthSignOut } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import { palette } from '@/theme/tokens';

import MyInfo from '../../app/(tabs)/(afterLogin)/my-info';
import { render } from '../setup/test-utils';

declare global {
  var mockReplace: jest.Mock;
  var mockPush: jest.Mock;
  var mockMyInfoFocusEffect: (() => void) | null;
}

jest.mock('@/api/push-token.api', () => ({
  deletePushToken: jest.fn(),
}));

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthSignOut: jest.fn(),
  useAuthUser: () => ({ nickname: 'testuser', userId: 'test123' }),
}));

jest.mock('@repo/shared/hooks/useStat', () => ({
  useMyStatsQuery: jest.fn(),
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
      push: (...args: unknown[]) => global.mockPush(...args),
      replace: (...args: unknown[]) => global.mockReplace(...args),
    },
    useFocusEffect: (effect: () => void) => {
      global.mockMyInfoFocusEffect = effect;
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
    global.mockMyInfoFocusEffect = null;
    (useNotifications as jest.Mock).mockReturnValue({
      pushToken: { data: 'expo-push-token' },
    });
    (useMyStatsQuery as jest.Mock).mockReturnValue({
      data: {
        nickname: 'testuser',
        currentLevel: 3,
        currentLevelProgress: 12,
        expForNextLevel: 42,
        availablePoints: 4,
      },
    });
  });

  it('프로필과 경험치 요약을 설정 화면 상단에 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByText, queryAllByText, queryByTestId } = render(<MyInfo />);

    expect(getByText('설정')).toBeOnTheScreen();
    expect(queryAllByText('testuser')).toHaveLength(1);
    expect(getByText('test123')).toBeOnTheScreen();
    expect(getByText('Lv. 3')).toBeOnTheScreen();
    expect(getByText('경험치')).toBeOnTheScreen();
    expect(getByText('EXP')).toBeOnTheScreen();
    expect(getByText('12')).toBeOnTheScreen();
    expect(getByText('/')).toBeOnTheScreen();
    expect(getByText('42')).toBeOnTheScreen();
    expect(queryByTestId('settings-stat-point-badge')).toBeNull();
  });

  it('프로필 페이지가 포커스될 때 경험치 정보를 다시 조회한다', () => {
    const refetch = jest.fn();

    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
    (useMyStatsQuery as jest.Mock).mockReturnValue({
      data: {
        nickname: 'testuser',
        currentLevel: 3,
        currentLevelProgress: 12,
        expForNextLevel: 42,
        availablePoints: 4,
      },
      refetch,
    });

    render(<MyInfo />);

    global.mockMyInfoFocusEffect?.();

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('설정 프로필 영역에 지정된 간격과 색상 토큰을 적용한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByTestId, getByText } = render(<MyInfo />);

    expect(
      StyleSheet.flatten(getByTestId('settings-profile').props.style),
    ).toEqual(
      expect.objectContaining({
        paddingTop: 0,
        paddingHorizontal: 24,
        paddingBottom: 23,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-profile-avatar').props.style),
    ).toEqual(
      expect.objectContaining({
        width: 48,
        height: 48,
        borderRadius: 24,
      }),
    );
    expect(getByTestId('settings-profile-character')).toBeOnTheScreen();
    expect(
      StyleSheet.flatten(getByTestId('settings-profile-text').props.style),
    ).toEqual(
      expect.objectContaining({
        marginLeft: 12,
        gap: 7,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-level-row').props.style),
    ).toEqual(
      expect.objectContaining({
        marginTop: 20,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-level-badge').props.style),
    ).toEqual(
      expect.objectContaining({
        height: 16,
        paddingHorizontal: 6,
        borderRadius: 99,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-row').props.style),
    ).toEqual(
      expect.objectContaining({
        marginTop: 8,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-title-row').props.style),
    ).toEqual(
      expect.objectContaining({
        gap: 5,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-value-row').props.style),
    ).toEqual(
      expect.objectContaining({
        gap: 2,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-progress-track').props.style),
    ).toEqual(
      expect.objectContaining({
        marginTop: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: palette.theme.softBlue[40],
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-progress-fill').props.style),
    ).toEqual(
      expect.objectContaining({
        borderRadius: 999,
        backgroundColor: palette.theme.blue[50],
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-divider').props.style),
    ).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.softBlue[20],
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-menu-list').props.style),
    ).toEqual(
      expect.objectContaining({
        paddingTop: 12,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-menu-item-한마디').props.style),
    ).toEqual(
      expect.objectContaining({
        height: 44,
        paddingLeft: 24,
      }),
    );

    const name = getByTestId('settings-profile-name');
    const userId = getByTestId('settings-profile-user-id');
    const level = getByTestId('settings-level-text');
    const expLabel = getByTestId('settings-exp-label');
    const expUnit = getByTestId('settings-exp-unit');
    const expCurrent = getByText('12');
    const menuText = getByTestId('settings-menu-text-한마디');

    expect(name.props.fontSize).toBe('$body2');
    expect(name.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(name.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.gray[80] }),
    );
    expect(userId.props.fontSize).toBe('$caption1');
    expect(userId.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(userId.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.softBlue[50] }),
    );
    expect(level.props.fontSize).toBe('$caption2');
    expect(level.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(level.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.blue[80] }),
    );
    expect(expLabel.props.fontSize).toBe('$body3');
    expect(expLabel.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(expLabel.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.blue[80] }),
    );
    expect(expUnit.props.fontSize).toBe('$caption2');
    expect(expUnit.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(expUnit.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.softBlue[60] }),
    );
    expect(expCurrent.props.fontSize).toBe('$caption2');
    expect(expCurrent.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(expCurrent.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.softBlue[80] }),
    );
    expect(menuText.props.fontSize).toBe('$body2');
    expect(menuText.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(menuText.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.gray[60] }),
    );
  });

  it('설정 메뉴를 스크린샷의 항목 순서와 라우트로 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByText } = render(<MyInfo />);

    expect(getByText('한마디')).toBeOnTheScreen();
    expect(getByText('스탯')).toBeOnTheScreen();
    expect(getByText('루틴 설정')).toBeOnTheScreen();
    expect(getByText('테마 설정')).toBeOnTheScreen();
    expect(getByText('알림 설정')).toBeOnTheScreen();
    expect(getByText('이용약관')).toBeOnTheScreen();
    expect(getByText('개인정보 처리방침')).toBeOnTheScreen();
    expect(getByText('문의')).toBeOnTheScreen();
    expect(getByText('로그아웃')).toBeOnTheScreen();

    fireEvent.press(getByText('한마디'));
    fireEvent.press(getByText('스탯'));
    fireEvent.press(getByText('루틴 설정'));
    fireEvent.press(getByText('테마 설정'));
    fireEvent.press(getByText('알림 설정'));
    fireEvent.press(getByText('문의'));

    expect(global.mockPush).toHaveBeenCalledWith('/modal?type=account');
    expect(global.mockPush).toHaveBeenCalledWith('/modal?type=stat');
    expect(global.mockPush).toHaveBeenCalledWith('/routine-settings');
    expect(global.mockPush).toHaveBeenCalledWith('/modal?type=theme');
    expect(global.mockPush).toHaveBeenCalledWith('/notification-settings');
    expect(global.mockPush).toHaveBeenCalledWith('/inquiry');
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
