import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import { FlatList, Modal } from 'react-native';

import { FlashList } from '@/components/ui/flash-list';
import { RANDOM_FRIEND_RECOMMENDATION_ENABLED_KEY_PREFIX } from '@/hooks/useRandomFriendRecommendationPreference';
import { useColorSchemeStore } from '@/store/color-scheme.store';
import { appThemes } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

import FriendPage from '../../app/(tabs)/(afterLogin)/(friend)/index';
import {
  act,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../setup/auth-test-utils';
import { createMockFriend, createMockFriends } from '../setup/friend/mock';

declare const mockPush: jest.Mock;

// FriendRequestResponse 형식에 맞는 mock 데이터 생성
const createMockFriendRequestResponse = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    senderNickname: `sender${i + 1}`,
    receiverNickname: 'testuser',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }));

let mockAxios: MockAdapter;

const randomFriendRecommendation = {
  nickname: '젤리',
  level: 6,
  job: '궁수',
  motto: '오늘도 한 걸음',
  characterCode: 'ARCHER_BEGINNER',
  characterImageUrl:
    'https://api.irura.uk/assets/characters/archer_beginner.png',
  backgroundImageUrl:
    'https://api.irura.uk/assets/backgrounds/archer_background.webp',
  recommendedDate: '2026-08-04',
  routines: [
    {
      routineName: '아침 산책',
      routineDetail: '30분 걷기',
      category: '운동',
      symbolColor: '#22CC88',
      routineCount: 3,
    },
  ],
};
const randomFriendRecommendationStorageKey = `${RANDOM_FRIEND_RECOMMENDATION_ENABLED_KEY_PREFIX}:test123`;

// axios response interceptor가 response.data.data를 반환하므로
// { data: [...] } 형태로 감싸야 함
const wrapResponse = <T,>(data: T) => ({ data });
const isFriendRequestsUrl = (url?: string) =>
  url?.includes('/friends/requests') ?? false;

// mock 설정 헬퍼 함수
const setupMocks = (friendsData: ReturnType<typeof createMockFriends> = []) => {
  mockAxios
    .onGet(/\/friends\/requests/)
    .reply(200, wrapResponse(createMockFriendRequestResponse(1)));
  mockAxios.onGet(/\/friends/).reply((config) => {
    if (config.url?.includes('/requests')) {
      return [200, wrapResponse(createMockFriendRequestResponse(1))];
    }
    return [200, wrapResponse(friendsData)];
  });
};

describe('친구 리스트 페이지', () => {
  beforeEach(async () => {
    resetAuthMocks();
    await AsyncStorage.removeItem(randomFriendRecommendationStorageKey);
    useColorSchemeStore.getState().setColorScheme('blue');
    useColorSchemeStore.getState().clearColorSchemeOverride();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios
      .onPost('/friends/random-recommendation')
      .reply(200, wrapResponse(randomFriendRecommendation));
  });

  afterEach(async () => {
    mockAxios.restore();
    // 비동기 업데이트 완료 대기
    await act(async () => {
      useColorSchemeStore.getState().clearColorSchemeOverride();
      useColorSchemeStore.getState().setColorScheme('blue');
    });
  });

  describe('친구 리스트 표시 테스트', () => {
    it('친구 목록 위에 랜덤 친구 추천 카드만 표시한다', async () => {
      setupMocks([]);

      const screen = render(<FriendPage />);

      expect(await screen.findByText('랜덤 친구 추천')).toBeOnTheScreen();
      expect(await screen.findByText('젤리')).toBeOnTheScreen();
      expect(await screen.findByText('Lv. 6 · 궁수')).toBeOnTheScreen();
      expect(await screen.findByText('오늘도 한 걸음')).toBeOnTheScreen();
      expect(
        await screen.findByLabelText('젤리에게 친구 요청'),
      ).toBeOnTheScreen();
      expect(screen.queryByText('2026-08-04')).not.toBeOnTheScreen();
      expect(screen.queryByText('아침 산책')).not.toBeOnTheScreen();
    });

    it('랜덤 친구 추천 제목과 카드를 낮은 위계의 크기로 표시한다', async () => {
      setupMocks([]);

      const screen = render(<FriendPage />);

      expect(await screen.findByText('랜덤 친구 추천')).toHaveStyle({
        color: appThemes.blue.colors.text.muted,
        fontSize: baseFoundation.typography.size.body2,
      });
      expect(await screen.findByTestId('random-friend-card')).toHaveStyle({
        height: baseFoundation.dimension.x250,
      });
      expect(await screen.findByTestId('random-friend-background')).toHaveProp(
        'resizeMode',
        'cover',
      );
      expect(await screen.findByTestId('random-friend-character')).toHaveStyle({
        width: baseFoundation.dimension.x140,
        height: baseFoundation.dimension.x140,
      });
      expect(
        await screen.findByTestId('random-friend-character-stage'),
      ).toHaveStyle({
        bottom: baseFoundation.spacing[16],
      });
    });

    it('랜덤 친구 추천 제목 아래에 자정까지 남은 시간을 초 단위로 표시한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-12T23:59:58.000'));
      setupMocks([]);

      try {
        const screen = render(<FriendPage />);

        const countdown = screen.getByTestId('random-friend-countdown');
        expect(countdown).toHaveTextContent('00:00:02');

        await act(async () => {
          jest.advanceTimersByTime(1000);
        });

        expect(countdown).toHaveTextContent('00:00:01');
      } finally {
        jest.useRealTimers();
      }
    });

    it('타이머를 시계 아이콘이 있는 반투명 캡슐로 표시한다', async () => {
      setupMocks([]);

      const screen = render(<FriendPage />);

      expect(
        await screen.findByTestId('random-friend-countdown-container'),
      ).toHaveStyle({
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        borderRadius: baseFoundation.radii.xs,
        height: baseFoundation.dimension.x24,
        paddingHorizontal: baseFoundation.spacing[2],
      });
      expect(screen.getByTestId('random-friend-countdown-icon')).toHaveProp(
        'name',
        'time-outline',
      );
      expect(screen.getByTestId('random-friend-countdown-icon')).toHaveProp(
        'size',
        baseFoundation.typography.size.caption1,
      );
      expect(screen.getByTestId('random-friend-countdown-icon')).toHaveProp(
        'color',
        appThemes.blue.colors.text.muted,
      );
      expect(screen.getByTestId('random-friend-countdown')).toHaveStyle({
        color: appThemes.blue.colors.text.muted,
      });
    });

    it('제목 우측 스위치 아래에 타이머와 추천 프로필을 순서대로 표시한다', async () => {
      setupMocks([]);

      const screen = render(<FriendPage />);

      expect(
        await screen.findByTestId('random-friend-recommendation-header-row'),
      ).toHaveStyle({
        flexDirection: 'row',
        justifyContent: 'space-between',
      });
      expect(screen.getByTestId('random-friend-countdown-row')).toHaveStyle({
        alignItems: 'flex-end',
      });
      expect(
        screen.getByLabelText('랜덤 친구 추천 받기').props.accessibilityState,
      ).toEqual(expect.objectContaining({ checked: true }));
      expect(screen.queryByText('추천 받기')).not.toBeOnTheScreen();
      expect(await screen.findByTestId('random-friend-card')).toBeOnTheScreen();
    });

    it('스위치를 끄면 타이머와 추천 프로필을 숨긴다', async () => {
      setupMocks([]);

      const screen = render(<FriendPage />);
      const recommendationSwitch = screen.getByLabelText('랜덤 친구 추천 받기');

      expect(await screen.findByTestId('random-friend-card')).toBeOnTheScreen();

      fireEvent(recommendationSwitch, 'valueChange', false);

      expect(
        screen.queryByTestId('random-friend-countdown-row'),
      ).not.toBeOnTheScreen();
      expect(screen.queryByTestId('random-friend-card')).not.toBeOnTheScreen();
      expect(recommendationSwitch.props.accessibilityState).toEqual(
        expect.objectContaining({ checked: false }),
      );
    });

    it('스위치 상태를 기기에 저장하고 다시 진입했을 때 복원한다', async () => {
      setupMocks([]);

      const firstScreen = render(<FriendPage />);
      const firstSwitch =
        await firstScreen.findByLabelText('랜덤 친구 추천 받기');

      fireEvent(firstSwitch, 'valueChange', false);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          randomFriendRecommendationStorageKey,
          'false',
        );
      });

      firstScreen.unmount();

      setupMocks([]);
      const secondScreen = render(<FriendPage />);
      const restoredSwitch =
        await secondScreen.findByLabelText('랜덤 친구 추천 받기');

      await waitFor(() => {
        expect(restoredSwitch.props.accessibilityState).toEqual(
          expect.objectContaining({ checked: false }),
        );
      });
      expect(
        secondScreen.queryByTestId('random-friend-card'),
      ).not.toBeOnTheScreen();
    });

    it('자정이 되면 랜덤 친구 추천 API를 다시 호출한다', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-08-12T23:59:59.000'));
      setupMocks([]);

      try {
        render(<FriendPage />);

        await act(async () => {
          jest.advanceTimersByTime(999);
          await Promise.resolve();
        });

        expect(
          mockAxios.history.post.filter(
            ({ url }) => url === '/friends/random-recommendation',
          ),
        ).toHaveLength(1);

        await act(async () => {
          jest.advanceTimersByTime(1000);
        });

        expect(
          mockAxios.history.post.filter(
            ({ url }) => url === '/friends/random-recommendation',
          ),
        ).toHaveLength(2);
      } finally {
        jest.useRealTimers();
      }
    });

    it('긴 추천 닉네임을 컴팩트한 아이콘 액션과 함께 표시한다', async () => {
      const longNickname = '매일꾸준한루틴메이커';
      mockAxios.onPost('/friends/random-recommendation').reply(
        200,
        wrapResponse({
          ...randomFriendRecommendation,
          nickname: longNickname,
        }),
      );
      setupMocks([]);

      const screen = render(<FriendPage />);

      const nickname = await screen.findByText(longNickname);

      expect(nickname).toHaveStyle({
        fontSize: baseFoundation.typography.size.body2,
      });
      expect(nickname).not.toHaveProp('numberOfLines');
      expect(screen.getByTestId('random-friend-identity')).toHaveStyle({
        flexDirection: 'column',
      });
      expect(
        screen.getByLabelText(`${longNickname}에게 친구 요청`),
      ).toHaveStyle({
        width: baseFoundation.dimension.x44,
        height: baseFoundation.dimension.x44,
      });
      expect(
        screen.getByTestId('random-friend-request-icon'),
      ).toBeOnTheScreen();
      expect(screen.getByTestId('random-friend-card')).toHaveStyle({
        height: baseFoundation.dimension.x250,
      });
    });

    it('추천 카드에서 친구 요청을 보낸다', async () => {
      setupMocks([]);
      mockAxios.onPost('/friends/requests').reply(201, {
        id: 10,
        senderNickname: 'testuser',
        receiverNickname: '젤리',
        status: 'PENDING',
        createdAt: '2026-08-12T12:00:00',
      });

      const screen = render(<FriendPage />);

      fireEvent.press(await screen.findByLabelText('젤리에게 친구 요청'));

      await waitFor(() => {
        const friendRequest = mockAxios.history.post.find(
          ({ url }) => url === '/friends/requests',
        );

        expect(friendRequest?.data).toBe(
          JSON.stringify({ receiverNickname: '젤리' }),
        );
      });
    });

    it('추천 후보가 없으면 서버 안내 문구와 다시 시도 버튼을 표시한다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onPost('/friends/random-recommendation').reply(400, {
        success: false,
        error: {
          message: '추천할 사용자가 없습니다.\n잠시 후 다시 시도해주세요.',
        },
      });
      setupMocks([]);

      const screen = render(<FriendPage />);

      expect(
        await screen.findByText(
          '추천할 사용자가 없습니다.\n잠시 후 다시 시도해주세요.',
        ),
      ).toBeOnTheScreen();
      expect(await screen.findByText('다시 시도')).toBeOnTheScreen();
    });

    describe('친구가 있는 경우', () => {
      beforeEach(() => {
        setupMocks(createMockFriends(3));
      });

      it('랜덤 친구 추천을 친구 목록과 같은 스크롤 콘텐츠에 포함한다', async () => {
        const screen = render(<FriendPage />);

        expect(await screen.findByText('friend1')).toBeOnTheScreen();

        const list = screen.UNSAFE_getByType(FlashList);

        expect(list.props.ListHeaderComponent).toEqual(
          expect.objectContaining({
            props: expect.objectContaining({
              testID: 'friend-list-header',
            }),
          }),
        );
      });

      it('친구 수와 2열 캐릭터 카드가 표시된다', async () => {
        const { findByLabelText, findByText } = render(<FriendPage />);

        expect(await findByText('friend1')).toBeOnTheScreen();
        expect(await findByText('전체 3명')).toBeOnTheScreen();
        expect(await findByText('오늘도 전진 1')).toBeOnTheScreen();
        expect(await findByText('Lv. 1')).toBeOnTheScreen();
        expect(await findByLabelText('friend1 캐릭터')).toBeOnTheScreen();
      });

      it('친구 목록 화면은 현재 내 테마 배경을 적용한다', async () => {
        const screen = render(<FriendPage />);

        expect(await screen.findByText('friend1')).toBeOnTheScreen();

        expect(screen.getByTestId('friend-page')).toHaveStyle({
          backgroundColor: appThemes.blue.colors.brand.card,
        });
      });

      it('친구 카드 배경은 친구 직업 테마의 30톤을 적용한다', async () => {
        const screen = render(<FriendPage />);

        expect(await screen.findByText('friend1')).toBeOnTheScreen();

        expect(
          screen.getByTestId('friend-character-panel-friend1'),
        ).toHaveStyle({
          backgroundColor: appThemes.red.colors.brand.primary,
        });
      });

      it('친구 목록 화면이 포커스되면 친구 테마 override를 즉시 해제한다', async () => {
        useColorSchemeStore.getState().setColorScheme('red');
        useColorSchemeStore.getState().setColorSchemeOverride('green');

        const screen = render(<FriendPage />);

        expect(await screen.findByText('friend1')).toBeOnTheScreen();
        await waitFor(() => {
          expect(useColorSchemeStore.getState().colorSchemeOverride).toBeNull();
        });
        expect(useColorSchemeStore.getState().colorScheme).toBe('red');
      });

      it('친구 테마 override가 남아 있어도 친구 목록 배경은 내 테마로 표시한다', async () => {
        useColorSchemeStore.getState().setColorScheme('blue');
        useColorSchemeStore.getState().setColorSchemeOverride('green');

        const screen = render(<FriendPage />);

        expect(await screen.findByText('friend1')).toBeOnTheScreen();
        expect(screen.getByTestId('friend-page')).toHaveStyle({
          backgroundColor: appThemes.blue.colors.brand.card,
        });
        expect(useColorSchemeStore.getState().colorSchemeOverride).toBeNull();
      });
    });

    describe('친구가 없는 경우', () => {
      beforeEach(() => {
        setupMocks([]);
      });

      it('빈 상태 메시지가 표시된다', async () => {
        const { findByText } = render(<FriendPage />);

        expect(await findByText('친구를 추가해보세요.')).toBeOnTheScreen();
      });
    });

    it('친구 추가 모달을 열고 닫는다', async () => {
      setupMocks([]);

      const screen = render(<FriendPage />);

      fireEvent.press(await screen.findByText('친구 추가'));
      await waitFor(() => {
        expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(true);
      });

      fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
      await waitFor(() => {
        expect(screen.UNSAFE_getByType(Modal).props.visible).toBe(false);
      });
    });
  });

  describe('친구 목록 API 테스트', () => {
    it('친구 카드 선택 시 목록 응답의 friendId로 루틴 화면을 연다', async () => {
      setupMocks([
        {
          ...createMockFriend(0),
          friendId: 42,
        },
      ]);

      const screen = render(<FriendPage />);

      fireEvent.press(await screen.findByLabelText('friend1 루틴 보기'));

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('friendId=42'),
      );
    });

    it('GET /friends 변경 응답의 한마디를 표시한다', async () => {
      mockAxios
        .onGet(/\/friends\/requests/)
        .reply(200, wrapResponse(createMockFriendRequestResponse(1)));
      mockAxios.onGet(/\/friends/).reply((config) => {
        if (config.url?.includes('/requests')) {
          return [200, wrapResponse(createMockFriendRequestResponse(1))];
        }

        return [
          200,
          wrapResponse([
            {
              nickname: '받는사람',
              motto: '오늘도 전진',
              mottos: ['오늘도 전진', '끝까지'],
              job: '마법사',
              profileImage: '...',
              level: 7,
              characterCode: 'MAGE_INTERMEDIATE',
              characterImageUrl: '/assets/characters/mage_intermediate.png',
            },
          ]),
        ];
      });
      mockAxios.onGet(/\/users\/search/).reply(200, wrapResponse([]));

      const { findByLabelText, findByText, queryByText } = render(
        <FriendPage />,
      );

      expect(await findByText('받는사람')).toBeOnTheScreen();
      expect(await findByText('오늘도 전진')).toBeOnTheScreen();
      expect(queryByText('마법사')).not.toBeOnTheScreen();
      expect(await findByText('Lv. 7')).toBeOnTheScreen();
      expect(await findByLabelText('받는사람 캐릭터')).toBeOnTheScreen();
    });

    it('GET /friends 응답의 캐릭터 정보를 표시한다', async () => {
      const friend = createMockFriend(0, {
        nickname: '김혜연',
        motto: null,
        mottos: [],
        mateNickname: null,
        job: '마법사',
        level: 7,
        characterCode: 'MAGE_INTERMEDIATE',
        characterImageUrl: '/assets/characters/mage_intermediate.png',
      });

      mockAxios
        .onGet(/\/friends\/requests/)
        .reply(200, wrapResponse(createMockFriendRequestResponse(1)));
      mockAxios.onGet(/\/friends/).reply((config) => {
        if (config.url?.includes('/requests')) {
          return [200, wrapResponse(createMockFriendRequestResponse(1))];
        }
        return [200, wrapResponse([friend])];
      });

      const { findByLabelText, findByText } = render(<FriendPage />);

      expect(await findByText('김혜연')).toBeOnTheScreen();
      expect(await findByText('friend-id-1')).toBeOnTheScreen();
      expect(await findByText('Lv. 7')).toBeOnTheScreen();
      expect(await findByLabelText('김혜연 캐릭터')).toBeOnTheScreen();
    });
  });

  describe('당겨서 새로고침 테스트', () => {
    beforeEach(() => {
      const allFriends = createMockFriends(2);

      mockAxios
        .onGet(/\/friends\/requests/)
        .reply(200, wrapResponse(createMockFriendRequestResponse(1)));
      mockAxios.onGet('/friends').reply(200, wrapResponse(allFriends));
    });

    it('아래로 당기면 친구 목록과 친구 요청 알림을 함께 다시 조회한다', async () => {
      const screen = render(<FriendPage />);

      expect(await screen.findByText('friend1')).toBeOnTheScreen();
      expect(
        mockAxios.history.get.filter(({ url }) => url === '/friends').length,
      ).toBe(1);
      expect(
        mockAxios.history.get.filter(({ url }) => isFriendRequestsUrl(url))
          .length,
      ).toBe(1);

      const list = screen.UNSAFE_getByType(FlatList);

      await act(async () => {
        await list.props.onRefresh();
      });

      await waitFor(() => {
        expect(
          mockAxios.history.get.filter(({ url }) => url === '/friends').length,
        ).toBe(2);
        expect(
          mockAxios.history.get.filter(({ url }) => isFriendRequestsUrl(url))
            .length,
        ).toBe(2);
      });
    });
  });
});
