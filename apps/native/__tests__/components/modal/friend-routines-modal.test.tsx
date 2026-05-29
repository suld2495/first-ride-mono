import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import { Image, StyleSheet, View } from 'react-native';

import FriendRoutinesModal from '@/components/modal/friend-routines-modal';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { appThemes } from '@/theme/themes';

import { act, render, resetAuthMocks } from '../../setup/auth-test-utils';

declare const mockSearchParams: Record<string, string | undefined>;

let mockAxios: MockAdapter;

const wrapResponse = <T,>(data: T) => ({ data });

const createFriendRoutineResponse = () => ({
  friend: {
    id: 42,
    nickname: '혜연',
    level: 7,
    motto: '오늘도 전진',
    job: '용사',
    characterCode: 'WARRIOR_INTERMEDIATE',
    characterImageUrl: null,
  },
  routines: [
    {
      routineId: 1,
      routineName: '운동 10분 이상',
      routineDetail: '매일 움직이기',
      penalty: 1000,
      routineCount: 5,
      mateNickname: '혜연',
      startDate: '2026-05-25',
      endDate: null,
      confirmCount: 0,
      weeklyCount: 3,
      successDate: [],
      displayOrder: 1,
      paused: false,
      hidden: false,
    },
  ],
});

describe('FriendRoutinesModal', () => {
  beforeEach(() => {
    resetAuthMocks();
    useColorSchemeStore.getState().setColorScheme('blue');
    mockAxios = new MockAdapter(axiosInstance);
    mockSearchParams.friendId = '42';
    mockSearchParams.friendNickname = '혜연';
    mockSearchParams.date = '2026-05-25';
  });

  afterEach(async () => {
    await act(async () => {
      useColorSchemeStore.getState().clearColorSchemeOverride();
      useColorSchemeStore.getState().setColorScheme('blue');
    });
    mockAxios.restore();
  });

  it('친구 프로필 조회 결과로 테마 컬러, 캐릭터, 배경을 적용한다', async () => {
    mockAxios.onGet('/friends/42/profile').reply(
      200,
      wrapResponse({
        friendId: 42,
        nickname: '혜연',
        job: '마법사',
        motto: '오늘도 전진',
        level: 7,
        characterCode: 'MAGE_INTERMEDIATE',
        characterImageUrl: 'https://cdn.example.com/characters/mage.png',
        backgroundImageUrl: 'https://cdn.example.com/backgrounds/mage.png',
      }),
    );
    mockAxios
      .onGet('/friends/42/routines?date=2026-05-25')
      .reply(200, wrapResponse({ friend: { id: 42 }, routines: [] }));

    const screen = render(<FriendRoutinesModal />);

    expect(
      await screen.findByTestId('friend-routine-scene-character'),
    ).toHaveProp('source', {
      uri: 'https://cdn.example.com/characters/mage.png',
    });
    expect(
      await screen.findByTestId('friend-routine-scene-background'),
    ).toHaveProp('source', {
      uri: 'https://cdn.example.com/backgrounds/mage.png',
    });
    expect(
      await screen.findByTestId('friend-routine-character-speech-bubble'),
    ).toBeOnTheScreen();
    expect(await screen.findByText('오늘도 전진')).toBeOnTheScreen();

    const redBackgroundViews = screen
      .UNSAFE_getAllByType(View)
      .filter(
        (node) =>
          StyleSheet.flatten(node.props.style)?.backgroundColor ===
          appThemes.red.colors.brand.secondary,
      );

    expect(redBackgroundViews).toHaveLength(1);
    expect(screen.UNSAFE_queryAllByType(Image)).toHaveLength(2);
  });

  it('내 테마가 달라도 루틴 카드 영역은 친구 프로필 테마를 사용한다', async () => {
    useColorSchemeStore.getState().setColorScheme('red');
    mockAxios.onGet('/friends/42/profile').reply(
      200,
      wrapResponse({
        friendId: 42,
        nickname: '혜연',
        job: '용사',
        motto: '오늘도 전진',
        level: 7,
        characterCode: 'WARRIOR_INTERMEDIATE',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
        backgroundImageUrl: 'https://cdn.example.com/backgrounds/warrior.png',
      }),
    );
    mockAxios
      .onGet('/friends/42/routines?date=2026-05-25')
      .reply(200, wrapResponse(createFriendRoutineResponse()));

    const screen = render(<FriendRoutinesModal />);

    expect(await screen.findByText('운동 10분 이상')).toBeOnTheScreen();
    expect(await screen.findByTestId('routine-count-check-1-1')).toHaveStyle({
      backgroundColor: appThemes.blue.colors.brand.selectedCheckbox,
    });
  });
});
