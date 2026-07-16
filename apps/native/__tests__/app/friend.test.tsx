import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';
import { FlatList, Modal, StyleSheet, View } from 'react-native';

import { useColorSchemeStore } from '@/store/color-scheme.store';
import { lightTheme } from '@/theme/themes/light';

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
  beforeEach(() => {
    resetAuthMocks();
    useColorSchemeStore.getState().setColorScheme('blue');
    useColorSchemeStore.getState().clearColorSchemeOverride();
    mockAxios = new MockAdapter(axiosInstance);
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
    describe('친구가 있는 경우', () => {
      beforeEach(() => {
        setupMocks(createMockFriends(3));
      });

      it('친구 수와 2열 캐릭터 카드가 표시된다', async () => {
        const { findByLabelText, findByText } = render(<FriendPage />);

        expect(await findByText('friend1')).toBeOnTheScreen();
        expect(await findByText('전체 3명')).toBeOnTheScreen();
        expect(await findByText('오늘도 전진 1')).toBeOnTheScreen();
        expect(await findByText('Lv. 1')).toBeOnTheScreen();
        expect(await findByLabelText('friend1 캐릭터')).toBeOnTheScreen();
      });

      it('친구 목록 화면에 파란 배경을 적용하지 않는다', async () => {
        const screen = render(<FriendPage />);

        expect(await screen.findByText('friend1')).toBeOnTheScreen();

        const blueBackgroundViews = screen
          .UNSAFE_getAllByType(View)
          .filter(
            (node) =>
              StyleSheet.flatten(node.props.style)?.backgroundColor ===
              lightTheme.colors.brand.secondary,
          );

        expect(blueBackgroundViews).toHaveLength(0);
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
