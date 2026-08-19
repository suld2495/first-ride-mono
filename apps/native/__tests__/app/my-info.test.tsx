import { useMyStatsQuery } from '@repo/shared/hooks/useStat';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import { Alert, StyleSheet } from 'react-native';

import { useAuthSignOut } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { palette } from '@/theme/tokens';

import MyInfo from '../../app/(tabs)/(afterLogin)/my-info';
import { render } from '../setup/test-utils';

declare global {
  var mockReplace: jest.Mock;
  var mockPush: jest.Mock;
  var mockMyInfoFocusEffect: (() => void) | null;
}

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

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
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
    useColorSchemeStore.getState().clearColorSchemeOverride();
    useColorSchemeStore.getState().setColorScheme('blue');
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
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        loginType: 'PLAIN',
        motto: null,
        mottos: [],
        role: 'USER',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
        backgroundImageUrl: 'https://cdn.example.com/backgrounds/warrior.webp',
      },
    });
  });

  it('프로필과 경험치 요약을 설정 화면 상단에 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByText, queryAllByText, queryByTestId, queryByText } = render(
      <MyInfo />,
    );

    expect(getByText('설정')).toBeOnTheScreen();
    expect(queryAllByText('testuser')).toHaveLength(1);
    expect(getByText('test123')).toBeOnTheScreen();
    expect(queryByText('레벨')).toBeNull();
    expect(getByText('Lv. 3')).toBeOnTheScreen();
    expect(getByText('경험치')).toBeOnTheScreen();
    expect(getByText('EXP')).toBeOnTheScreen();
    expect(getByText('12')).toBeOnTheScreen();
    expect(getByText('/')).toBeOnTheScreen();
    expect(getByText('42')).toBeOnTheScreen();
    expect(queryByTestId('settings-stat-point-badge')).toBeNull();
  });

  it('SNS 회원은 아이디 대신 로그인 유형 배지를 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'kakao_12345',
        nickname: 'testuser',
        loginType: 'KAKAO',
        motto: null,
        mottos: [],
        role: 'USER',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
      },
    });

    const { getByTestId, getByText, queryByTestId, queryByText } = render(
      <MyInfo />,
    );

    expect(queryByTestId('settings-profile-user-id')).toBeNull();
    expect(queryByText('test123')).toBeNull();
    expect(
      StyleSheet.flatten(
        getByTestId('settings-profile-login-type-badge').props.style,
      ),
    ).toEqual(expect.objectContaining({ backgroundColor: '#FEE500' }));
    expect(
      StyleSheet.flatten(
        getByTestId('settings-profile-login-type-text').props.style,
      ),
    ).toEqual(expect.objectContaining({ color: '#000000' }));
    expect(getByText('카카오')).toBeOnTheScreen();
  });

  it('Apple 회원 배지에 검정 배경과 흰색 텍스트를 적용한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'apple_12345',
        nickname: 'testuser',
        loginType: 'APPLE',
        motto: null,
        mottos: [],
        role: 'USER',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
      },
    });

    const { getByTestId, getByText } = render(<MyInfo />);

    expect(
      StyleSheet.flatten(
        getByTestId('settings-profile-login-type-badge').props.style,
      ),
    ).toEqual(expect.objectContaining({ backgroundColor: '#000000' }));
    expect(
      StyleSheet.flatten(
        getByTestId('settings-profile-login-type-text').props.style,
      ),
    ).toEqual(expect.objectContaining({ color: '#FFFFFF' }));
    expect(getByText('Apple')).toBeOnTheScreen();
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

    const { getByTestId, getByText, queryByTestId } = render(<MyInfo />);

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
        width: 60,
        height: 60,
        borderRadius: 12,
      }),
    );
    expect(getByTestId('settings-profile-character')).toBeOnTheScreen();
    expect(getByTestId('settings-profile-character')).toHaveProp('source', {
      uri: 'https://cdn.example.com/characters/warrior.png',
    });
    expect(
      StyleSheet.flatten(getByTestId('settings-profile-character').props.style),
    ).toEqual(
      expect.objectContaining({
        width: 56,
        height: 56,
        transform: [{ translateY: -6 }],
      }),
    );
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
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
      }),
    );
    const levelBadgeStyle = StyleSheet.flatten(
      getByTestId('settings-level-badge').props.style,
    );

    expect(levelBadgeStyle.height).toBeUndefined();
    expect(levelBadgeStyle.paddingHorizontal).toBeUndefined();
    expect(levelBadgeStyle.borderRadius).toBeUndefined();
    expect(levelBadgeStyle.backgroundColor).toBeUndefined();
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-row').props.style),
    ).toEqual(
      expect.objectContaining({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      }),
    );
    expect(queryByTestId('settings-level-label')).toBeNull();
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-value-row').props.style),
    ).toEqual(
      expect.objectContaining({
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        gap: 8,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-number-row').props.style),
    ).toEqual(
      expect.objectContaining({
        alignItems: 'flex-end',
        gap: 2,
      }),
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-info-button').props.style),
    ).toEqual(
      expect.objectContaining({
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: palette.theme.blue[80],
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
      expect.objectContaining({
        color: palette.theme.gray[80],
        fontSize: 17,
      }),
    );
    expect(userId.props.fontSize).toBe('$caption1');
    expect(userId.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(userId.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.softBlue[50] }),
    );
    expect(level.props.fontSize).toBe('$h3');
    expect(level.props.fontWeight).toBe('700');
    expect(StyleSheet.flatten(level.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[80],
        fontFamily: 'Poppins_700Bold',
        fontSize: 18,
        textAlign: 'right',
      }),
    );
    expect(expLabel.props.fontSize).toBe('$body3');
    expect(expLabel.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(expLabel.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[80],
        fontSize: 13,
      }),
    );
    expect(expUnit.props.fontSize).toBe('$caption2');
    expect(expUnit.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(expUnit.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.softBlue[60],
        fontSize: 13,
      }),
    );
    expect(expCurrent.props.fontSize).toBe('$caption2');
    expect(expCurrent.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(expCurrent.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.softBlue[60],
        fontSize: 13,
      }),
    );
    expect(getByTestId('settings-exp-info-icon').props.fontSize).toBe(
      '$caption2',
    );
    expect(
      StyleSheet.flatten(getByTestId('settings-exp-info-icon').props.style),
    ).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[80],
        fontSize: 11,
      }),
    );
    expect(menuText.props.fontSize).toBe('$body2');
    expect(menuText.props.fontWeight).toBe('400');
    expect(StyleSheet.flatten(menuText.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.gray[60] }),
    );
  });

  it.each([
    [
      'green',
      palette.theme.green[80],
      palette.theme.softGreen[60],
      palette.theme.green[50],
    ],
    [
      'red',
      palette.theme.red[80],
      palette.theme.softRed[60],
      palette.theme.red[50],
    ],
  ] as const)(
    '%s 테마의 색상 토큰으로 경험치 요약을 표시한다',
    (themeName, levelColor, expColor, progressColor) => {
      (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
      useColorSchemeStore.getState().setColorScheme(themeName);

      const { getByTestId } = render(<MyInfo />);

      expect(
        StyleSheet.flatten(getByTestId('settings-level-text').props.style),
      ).toEqual(expect.objectContaining({ color: levelColor }));
      expect(
        StyleSheet.flatten(getByTestId('settings-exp-unit').props.style),
      ).toEqual(expect.objectContaining({ color: expColor, fontSize: 13 }));
      expect(
        StyleSheet.flatten(getByTestId('settings-exp-current').props.style),
      ).toEqual(expect.objectContaining({ color: expColor, fontSize: 13 }));
      expect(
        StyleSheet.flatten(getByTestId('settings-exp-info-button').props.style),
      ).toEqual(expect.objectContaining({ borderColor: levelColor }));
      expect(
        StyleSheet.flatten(getByTestId('settings-progress-fill').props.style),
      ).toEqual(expect.objectContaining({ backgroundColor: progressColor }));
    },
  );

  it('경험치 목표가 0이면 진행률을 0으로 표시하고 선택 정보가 없어도 렌더링한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
    (useMyStatsQuery as jest.Mock).mockReturnValue({
      data: {
        currentLevel: undefined,
        currentLevelProgress: undefined,
        expForNextLevel: 0,
      },
    });
    (useFetchMeQuery as jest.Mock).mockReturnValue({ data: undefined });

    const { getByTestId, getByText, queryByTestId } = render(<MyInfo />);

    expect(getByText('Lv. 1')).toBeOnTheScreen();
    expect(getByTestId('settings-exp-current')).toHaveTextContent('0');
    expect(getByTestId('settings-exp-next')).toHaveTextContent('0');
    expect(
      StyleSheet.flatten(getByTestId('settings-progress-fill').props.style),
    ).toEqual(expect.objectContaining({ width: '0%' }));
    expect(queryByTestId('settings-profile-character')).toBeNull();
    expect(queryByTestId('settings-profile-user-id')).toBeNull();
  });

  it('경험치 인포 버튼을 누르면 캐릭터 진화 정책 모달을 표시하고 닫을 수 있다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByTestId, queryByTestId } = render(<MyInfo />);

    expect(queryByTestId('settings-evolution-modal')).toBeNull();

    fireEvent.press(getByTestId('settings-exp-info-button'));

    expect(getByTestId('settings-evolution-modal')).toBeOnTheScreen();
    expect(getByTestId('settings-evolution-modal-title')).toHaveTextContent(
      '캐릭터 진화',
    );
    expect(
      getByTestId('settings-evolution-modal-description'),
    ).toHaveTextContent(
      '레벨에 따라 캐릭터 모습이 바뀌어요. (베타기간에는 10EXP 마다 1레벨이 올라요)',
    );
    expect(getByTestId('settings-evolution-stage-초보자')).toBeOnTheScreen();
    expect(getByTestId('settings-evolution-stage-1차 전직')).toBeOnTheScreen();
    expect(getByTestId('settings-evolution-stage-2차 전직')).toBeOnTheScreen();
    expect(getByTestId('settings-evolution-character-초보자')).toHaveProp(
      'source',
      expect.objectContaining({
        testUri: expect.stringContaining(
          'evolution/warrior_female_beginner.png',
        ),
      }),
    );
    expect(getByTestId('settings-evolution-character-1차 전직')).toHaveProp(
      'source',
      expect.objectContaining({
        testUri: expect.stringContaining(
          'evolution/warrior_female_intermediate.png',
        ),
      }),
    );
    expect(getByTestId('settings-evolution-character-2차 전직')).toHaveProp(
      'source',
      expect.objectContaining({
        testUri: expect.stringContaining(
          'evolution/warrior_female_advanced.png',
        ),
      }),
    );
    expect(
      StyleSheet.flatten(
        getByTestId('settings-evolution-character-1차 전직').props.style,
      ),
    ).not.toEqual(expect.objectContaining({ tintColor: expect.any(String) }));
    expect(
      getByTestId('settings-evolution-character-question-1차 전직'),
    ).toHaveTextContent('?');
    expect(
      getByTestId('settings-evolution-character-question-2차 전직'),
    ).toHaveTextContent('?');
    expect(
      queryByTestId('settings-evolution-character-question-초보자'),
    ).toBeNull();

    fireEvent.press(getByTestId('settings-evolution-modal-close'));

    expect(queryByTestId('settings-evolution-modal')).toBeNull();
  });

  it('남자 캐릭터 사용자는 캐릭터 진화 모달에 남자 초보자 이미지를 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        loginType: 'PLAIN',
        motto: null,
        mottos: [],
        role: 'USER',
        gender: 'MALE',
        characterCode: 'WARRIOR_MALE_BEGINNER',
        characterImageUrl:
          'https://cdn.example.com/characters/warrior_male_beginner.png',
      },
    });

    const { getByTestId, queryByTestId } = render(<MyInfo />);

    fireEvent.press(getByTestId('settings-exp-info-button'));

    expect(getByTestId('settings-evolution-character-초보자')).toHaveProp(
      'source',
      expect.objectContaining({
        testUri: expect.stringContaining('evolution/warrior_male_beginner.png'),
      }),
    );

    fireEvent.press(getByTestId('settings-evolution-modal-close'));

    expect(queryByTestId('settings-evolution-modal')).toBeNull();
  });

  it.each([
    ['red', 'mage'],
    ['green', 'archer'],
  ] as const)(
    '%s 테마의 캐릭터 진화 모달에는 해당 직업의 모달 전용 진화 이미지를 표시한다',
    (themeName, jobType) => {
      (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
      useColorSchemeStore.getState().setColorScheme(themeName);

      const { getByTestId } = render(<MyInfo />);

      fireEvent.press(getByTestId('settings-exp-info-button'));

      expect(getByTestId('settings-evolution-character-초보자')).toHaveProp(
        'source',
        expect.objectContaining({
          testUri: expect.stringContaining(`${jobType}_female_beginner.png`),
        }),
      );
      expect(getByTestId('settings-evolution-character-1차 전직')).toHaveProp(
        'source',
        expect.objectContaining({
          testUri: expect.stringContaining(
            `${jobType}_female_intermediate.png`,
          ),
        }),
      );
      expect(getByTestId('settings-evolution-character-2차 전직')).toHaveProp(
        'source',
        expect.objectContaining({
          testUri: expect.stringContaining(`${jobType}_female_advanced.png`),
        }),
      );
      expect(
        StyleSheet.flatten(
          getByTestId('settings-evolution-character-1차 전직').props.style,
        ),
      ).not.toEqual(expect.objectContaining({ tintColor: expect.any(String) }));
      expect(
        StyleSheet.flatten(
          getByTestId('settings-evolution-character-2차 전직').props.style,
        ),
      ).not.toEqual(expect.objectContaining({ tintColor: expect.any(String) }));
      expect(
        getByTestId('settings-evolution-character-question-1차 전직'),
      ).toBeOnTheScreen();
      expect(
        getByTestId('settings-evolution-character-question-2차 전직'),
      ).toBeOnTheScreen();
    },
  );

  it('성별 필드가 없어도 캐릭터 코드에서 남자 캐릭터를 판별한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        loginType: 'PLAIN',
        motto: null,
        mottos: [],
        role: 'USER',
        characterCode: 'MAGE_MALE_BEGINNER',
        characterImageUrl: '/assets/characters/mage_male_beginner.png',
      },
    });
    useColorSchemeStore.getState().setColorScheme('red');

    const { getByTestId } = render(<MyInfo />);

    fireEvent.press(getByTestId('settings-exp-info-button'));

    expect(getByTestId('settings-evolution-character-초보자')).toHaveProp(
      'source',
      expect.objectContaining({
        testUri: expect.stringContaining('evolution/mage_male_beginner.png'),
      }),
    );
    expect(getByTestId('settings-evolution-character-1차 전직')).toHaveProp(
      'source',
      expect.objectContaining({
        testUri: expect.stringContaining(
          'evolution/mage_male_intermediate.png',
        ),
      }),
    );
    expect(
      StyleSheet.flatten(
        getByTestId('settings-evolution-character-1차 전직').props.style,
      ),
    ).not.toEqual(expect.objectContaining({ tintColor: expect.any(String) }));
  });

  it('문의 항목을 숨기고 나머지 설정 항목 라우트는 유지한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByTestId, getByText, queryByText } = render(<MyInfo />);

    expect(getByTestId('settings-scroll-view')).toBeOnTheScreen();
    expect(getByText('한마디')).toBeOnTheScreen();
    expect(queryByText('스탯')).toBeNull();
    expect(getByText('루틴 설정')).toBeOnTheScreen();
    expect(queryByText('테마 설정')).toBeNull();
    expect(getByText('알림 설정')).toBeOnTheScreen();
    expect(getByText('공개 설정')).toBeOnTheScreen();
    expect(getByText('베타 피드백')).toBeOnTheScreen();
    expect(queryByText('개인정보 설정')).toBeNull();
    expect(getByText('약관')).toBeOnTheScreen();
    expect(queryByText('이용약관')).toBeNull();
    expect(queryByText('개인정보 처리방침')).toBeNull();
    expect(queryByText('문의')).toBeNull();
    expect(getByText('이루라 길드')).toBeOnTheScreen();
    expect(getByText('로그아웃')).toBeOnTheScreen();

    const menuItemTestIDs = within(getByTestId('settings-menu-list'))
      .getAllByRole('button')
      .map((item) => item.props.testID);
    expect(menuItemTestIDs).toEqual(
      expect.arrayContaining([
        'settings-menu-item-알림 설정',
        'settings-menu-item-공개 설정',
      ]),
    );
    expect(menuItemTestIDs.indexOf('settings-menu-item-공개 설정')).toBe(
      menuItemTestIDs.indexOf('settings-menu-item-알림 설정') + 1,
    );

    fireEvent.press(getByText('한마디'));
    fireEvent.press(getByText('루틴 설정'));
    fireEvent.press(getByText('알림 설정'));
    fireEvent.press(getByText('공개 설정'));
    fireEvent.press(getByText('베타 피드백'));
    fireEvent.press(getByText('약관'));
    fireEvent.press(getByText('이루라 길드'));

    expect(global.mockPush).toHaveBeenCalledWith('/modal?type=account');
    expect(global.mockPush).toHaveBeenCalledWith('/routine-settings');
    expect(global.mockPush).toHaveBeenCalledWith('/notification-settings');
    expect(global.mockPush).toHaveBeenCalledWith('/visibility-settings');
    expect(global.mockPush).toHaveBeenCalledWith('/beta-feedback');
    expect(global.mockPush).toHaveBeenCalledWith('/terms');
    expect(global.mockPush).toHaveBeenCalledWith('/hall-of-heroes');
  });

  it('로그아웃 아래에 베타 피드백을 빨간색으로 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByTestId } = render(<MyInfo />);
    const menuButtons = within(getByTestId('settings-menu-list')).getAllByRole(
      'button',
    );
    const feedbackText = getByTestId('settings-menu-text-베타 피드백');

    expect(menuButtons.slice(-2).map((button) => button.props.testID)).toEqual([
      'settings-menu-item-로그아웃',
      'settings-menu-item-베타 피드백',
    ]);
    expect(StyleSheet.flatten(feedbackText.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.red[50] }),
    );
    expect(feedbackText.props.fontWeight).toBe('400');
  });

  it('회원 탈퇴를 메뉴와 분리된 화면 최하단에 한 단계 작은 글자로 표시한다', () => {
    (useAuthSignOut as jest.Mock).mockReturnValue(jest.fn());

    const { getByTestId, getByText, queryByText } = render(<MyInfo />);
    const deletionSection = getByTestId('settings-account-deletion');
    const deletionText = getByTestId('settings-account-deletion-text');

    expect(queryByText('회원 탈퇴')).toBeOnTheScreen();
    expect(
      within(getByTestId('settings-menu-list')).queryByText('회원 탈퇴'),
    ).toBeNull();
    expect(StyleSheet.flatten(deletionSection.props.style)).toEqual(
      expect.objectContaining({ marginTop: 'auto' }),
    );
    expect(deletionText.props.fontSize).toBe('$body3');
    expect(deletionText.props.fontWeight).toBe('400');
    expect(StyleSheet.flatten(deletionText.props.style)).toEqual(
      expect.objectContaining({ color: palette.theme.gray[30] }),
    );

    fireEvent.press(getByText('회원 탈퇴'));

    expect(global.mockPush).toHaveBeenCalledWith('/delete-account');
  });

  it('로그아웃 정리에서 사용할 푸시 토큰을 인증 스토어에 전달한다', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    let confirmLogout: (() => void | Promise<void>) | undefined;

    (useAuthSignOut as jest.Mock).mockReturnValue(signOut);
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
      expect(signOut).toHaveBeenCalledWith('expo-push-token');
      expect(global.mockReplace).not.toHaveBeenCalledWith('/sign-in');
    });
  });
});
