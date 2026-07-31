import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Path } from 'react-native-svg';

import FriendRoutinesModal from '@/components/modal/friend-routines-modal';
import ModalHeaderActionContext from '@/components/modal/modal-header-action-context';
import ModalHeaderActionProvider from '@/components/modal/modal-header-action-provider';
import * as routineSceneArt from '@/components/routine/routine-scene-art';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { appThemes } from '@/theme/themes';
import { baseFoundation, palette } from '@/theme/tokens';

import {
  act,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../../setup/auth-test-utils';

declare const mockSearchParams: Record<string, string | undefined>;
declare const mockPush: jest.Mock;
declare const mockShowToast: jest.Mock;
declare const mockRoutineStore: {
  type: 'number' | 'week';
};

let mockAxios: MockAdapter;

const wrapResponse = <T,>(data: T) => ({ data });

const ModalHeaderActionOutlet = () => {
  const context = useContext(ModalHeaderActionContext);

  return (
    <View testID="friend-routines-page-header-actions">{context?.action}</View>
  );
};

const renderFriendRoutinesModal = () =>
  render(
    <ModalHeaderActionProvider>
      <FriendRoutinesModal />
      <ModalHeaderActionOutlet />
    </ModalHeaderActionProvider>,
  );

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
    mockShowToast.mockClear();
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

    const screen = renderFriendRoutinesModal();

    const character = await screen.findByTestId(
      'friend-routine-scene-character',
    );

    expect(character).toHaveProp('source', {
      uri: 'https://cdn.example.com/characters/mage.png',
    });
    const characterStage = screen
      .UNSAFE_getAllByType(View)
      .filter((node) => {
        const style = StyleSheet.flatten(node.props.style);

        return (
          style?.alignItems === 'center' &&
          style?.justifyContent === 'center' &&
          node.findAllByProps({
            testID: 'friend-routine-scene-character',
          }).length > 0
        );
      })
      .pop();

    expect(StyleSheet.flatten(characterStage?.props.style)).toEqual(
      expect.objectContaining({
        alignSelf: 'center',
        bottom: baseFoundation.dimension.x48,
        position: 'absolute',
      }),
    );
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
    expect(screen.queryByLabelText('한마디 수정')).toBeNull();
    expect(
      screen.queryByTestId('character-motto-speech-bubble-edit-icon'),
    ).toBeNull();

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

    const screen = renderFriendRoutinesModal();

    expect(await screen.findByText('운동 10분 이상')).toBeOnTheScreen();
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

    const screen = renderFriendRoutinesModal();

    expect(await screen.findByText('운동 10분 이상')).toBeOnTheScreen();
    expect(
      await screen.findByTestId('routine-week-progress-1'),
    ).toHaveTextContent('3/5');
    expect(
      StyleSheet.flatten(
        (await screen.findByTestId('routine-week-progress-summary-1')).props
          .style,
      ),
    ).toEqual(expect.objectContaining({ marginLeft: 'auto' }));
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

    const screen = renderFriendRoutinesModal();

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

    const screen = renderFriendRoutinesModal();

    expect(await screen.findByText('오늘도 전진')).toBeOnTheScreen();
    expect(screen.queryByTestId('friend-routine-scene-character')).toBeNull();
    expect(screen.queryByTestId('friend-routine-scene-background')).toBeNull();
  });

  it('응원 콕 버튼을 상단 친구 타이틀 우측에 표시한다', async () => {
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

    const screen = renderFriendRoutinesModal();

    const cheerButton = await screen.findByRole('button', { name: '응원 콕' });

    expect(
      screen
        .getByTestId('friend-routines-page-header-actions')
        .findAll((node: typeof cheerButton) => node === cheerButton),
    ).toHaveLength(1);
    expect(cheerButton).toHaveStyle({
      backgroundColor: palette.white,
      borderColor: palette.theme.gray[50],
      borderRadius: baseFoundation.dimension.x8,
      borderWidth: baseFoundation.dimension.x1,
      height: baseFoundation.dimension.x30,
      paddingHorizontal: baseFoundation.spacing[0],
      width: 67,
    });

    const cheerIcon = screen.getByTestId('friend-cheer-icon');

    expect(cheerIcon).toHaveProp('width', baseFoundation.iconSize.xs);
    expect(cheerIcon).toHaveProp('height', baseFoundation.dimension.x13);
    expect(
      cheerIcon
        .findAllByType(Path)
        .map((path: typeof cheerIcon) => path.props.fill),
    ).toEqual([palette.theme.blue[50], palette.theme.blue[50]]);
    expect(
      cheerButton
        .findAll((node: typeof cheerButton) => node !== cheerButton)
        .some(
          (node: typeof cheerButton) =>
            StyleSheet.flatten(node.props.style)?.gap === 3,
        ),
    ).toBe(true);
    expect(screen.getByText('응원')).toHaveStyle({
      color: palette.theme.gray[70],
      fontSize: baseFoundation.typography.size.caption1,
    });
  });

  it('응원 콕 전송 중에는 응원 아이콘만 로딩 아이콘으로 교체한다', async () => {
    let resolveCheerRequest:
      | ((response: [number, { message: string }]) => void)
      | undefined;

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
    mockAxios.onPost('/friends/42/cheer').reply(
      () =>
        new Promise((resolve) => {
          resolveCheerRequest = resolve;
        }),
    );

    const screen = renderFriendRoutinesModal();
    const cheerButton = await screen.findByRole('button', { name: '응원 콕' });

    fireEvent.press(cheerButton);

    const loadingIcon = await screen.findByTestId(
      'friend-cheer-loading-icon',
    );

    expect(loadingIcon).toHaveProp('color', palette.theme.blue[50]);
    expect(loadingIcon).toHaveProp('size', baseFoundation.iconSize.xs);
    expect(screen.getByText('응원')).toBeOnTheScreen();
    expect(screen.queryByTestId('friend-cheer-icon')).toBeNull();
    expect(cheerButton).toHaveStyle({
      height: baseFoundation.dimension.x30,
      opacity: 1,
      width: 67,
    });
    expect(cheerButton).toBeDisabled();

    await act(async () => {
      resolveCheerRequest?.([200, { message: '응원 완료' }]);
    });
  });

  it('응원 콕을 보낸 뒤 루틴과 프로필을 다시 조회하지 않고 서버 메시지를 표시한다', async () => {
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
    mockAxios.onPost('/friends/42/cheer').reply(200, {
      cheerId: 10,
      senderId: 1,
      senderNickname: '윤윤',
      receiverId: 42,
      receiverNickname: '혜연',
      message: '윤윤님이 함께 모험을 떠나자고 합니다!',
      createdAt: '2026-07-29 14:10',
    });

    const screen = renderFriendRoutinesModal();

    fireEvent.press(await screen.findByRole('button', { name: '응원 콕' }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        '윤윤님이 함께 모험을 떠나자고 합니다!',
        'success',
      );
    });

    expect(mockAxios.history.post).toHaveLength(1);
    expect(mockAxios.history.post[0].url).toBe('/friends/42/cheer');
    expect(mockAxios.history.get).toHaveLength(2);
  });

  it('응원 콕 전송이 거절되면 서버 오류 메시지를 표시한다', async () => {
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
    mockAxios.onPost('/friends/42/cheer').reply(429, {
      success: false,
      error: {
        message: '같은 친구에게는 1시간에 한 번만 응원 콕을 보낼 수 있습니다.',
      },
    });

    const screen = renderFriendRoutinesModal();

    fireEvent.press(await screen.findByRole('button', { name: '응원 콕' }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      '같은 친구에게는 1시간에 한 번만 응원 콕을 보낼 수 있습니다.',
      'error',
    );
  });
});
