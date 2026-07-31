import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import { Image, StyleSheet, View } from 'react-native';

import FriendRoutinesModal from '@/components/modal/friend-routines-modal';
import * as routineSceneArt from '@/components/routine/routine-scene-art';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { appThemes } from '@/theme/themes';

import {
  act,
  fireEvent,
  render,
  resetAuthMocks,
} from '../../setup/auth-test-utils';

declare const mockSearchParams: Record<string, string | undefined>;
declare const mockPush: jest.Mock;
declare const mockRoutineStore: {
  type: 'number' | 'week';
};

let mockAxios: MockAdapter;

const wrapResponse = <T,>(data: T) => ({ data });

const createFriendRoutineResponse = () => ({
  friend: {
    id: 42,
    nickname: '혜연',
    level: 7,
    motto: '오늘도 전진',
    job: '검사',
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
    jest.restoreAllMocks();
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
    ).toHaveProp(
      'source',
      routineSceneArt.routineSceneBackgroundAssets.red.source,
    );
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
        job: '검사',
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
    expect(await screen.findByTestId('routine-count-card-outer-1')).toHaveStyle(
      {
        backgroundColor: '#FFFFFF',
        borderColor: '#000306',
        borderWidth: 1,
        padding: 4,
      },
    );
    expect(
      await screen.findByTestId('routine-count-card-surface-1'),
    ).toHaveStyle({
      borderColor: appThemes.blue.colors.brand.primary,
    });
    expect(await screen.findByTestId('routine-count-check-1-1')).toHaveStyle({
      backgroundColor: appThemes.blue.colors.brand.primary,
    });
  });

  it('친구 홈의 주간 루틴 카드에도 수행 횟수를 표시하고 메뉴는 숨긴다', async () => {
    mockRoutineStore.type = 'week';
    mockAxios.onGet('/friends/42/profile').reply(
      200,
      wrapResponse({
        friendId: 42,
        nickname: '혜연',
        job: '검사',
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
    expect(
      await screen.findByTestId('routine-week-progress-1'),
    ).toHaveTextContent('3/5');
    expect(
      StyleSheet.flatten(
        (await screen.findByTestId('routine-week-progress-summary-1')).props
          .style,
      ),
    ).toEqual(expect.objectContaining({ right: 16 }));
    expect(screen.queryByLabelText('운동 10분 이상 메뉴 열기')).toBeNull();
  });

  it('날짜를 이동해도 라우터 push 없이 루틴 영역만 갱신한다', async () => {
    const getRemoteAssetSpy = jest.spyOn(
      routineSceneArt,
      'getRoutineSceneRemoteAsset',
    );

    mockAxios.onGet('/friends/42/profile').reply(
      200,
      wrapResponse({
        friendId: 42,
        nickname: '혜연',
        job: '검사',
        motto: '오늘도 전진',
        level: 7,
        characterCode: 'WARRIOR_INTERMEDIATE',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
        backgroundImageUrl: 'https://cdn.example.com/backgrounds/warrior.png',
      }),
    );
    mockAxios
      .onGet('/friends/42/routines?date=2026-05-25')
      .reply(200, wrapResponse(createFriendRoutineResponse()))
      .onGet('/friends/42/routines?date=2026-06-01')
      .reply(
        200,
        wrapResponse({
          friend: { id: 42 },
          routines: [
            {
              ...createFriendRoutineResponse().routines[0],
              routineId: 2,
              routineName: '휴식하기',
            },
          ],
        }),
      );

    const screen = render(<FriendRoutinesModal />);

    expect(await screen.findByText('운동 10분 이상')).toBeOnTheScreen();
    const initialRemoteAssetCallCount = getRemoteAssetSpy.mock.calls.length;

    fireEvent.press(await screen.findByLabelText('다음 주'));

    expect(
      screen.getByTestId('friend-routine-scene-character'),
    ).toBeOnTheScreen();
    expect(await screen.findByText('휴식하기')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
    expect(getRemoteAssetSpy).toHaveBeenCalledTimes(
      initialRemoteAssetCallCount,
    );
  });

  it('친구 이미지 URL이 없으면 프론트 캐릭터와 배경을 폴백으로 표시하지 않는다', async () => {
    mockAxios.onGet('/friends/42/profile').reply(
      200,
      wrapResponse({
        friendId: 42,
        nickname: '혜연',
        job: '검사',
        motto: '오늘도 전진',
        level: 7,
        characterCode: 'WARRIOR_INTERMEDIATE',
        characterImageUrl: null,
        backgroundImageUrl: null,
      }),
    );
    mockAxios
      .onGet('/friends/42/routines?date=2026-05-25')
      .reply(200, wrapResponse({ friend: { id: 42 }, routines: [] }));

    const screen = render(<FriendRoutinesModal />);

    expect(await screen.findByText('오늘도 전진')).toBeOnTheScreen();
    expect(screen.queryByTestId('friend-routine-scene-character')).toBeNull();
    expect(screen.queryByTestId('friend-routine-scene-background')).toBeNull();
  });
});
