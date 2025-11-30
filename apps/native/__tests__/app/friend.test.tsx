import { Alert, Pressable } from 'react-native';
import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';

import FriendPage from '../../app/(tabs)/(afterLogin)/(friend)/index';
import {
  act,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../setup/auth-test-utils';
import { createMockFriends } from '../setup/friend/mock';

// Alert.alert 스파이 설정
jest.spyOn(Alert, 'alert');

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
    mockAxios = new MockAdapter(axiosInstance);
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(async () => {
    mockAxios.restore();
    // 비동기 업데이트 완료 대기
    await act(async () => {});
  });

  describe('친구 리스트 표시 테스트', () => {
    describe('친구가 있는 경우', () => {
      beforeEach(() => {
        setupMocks(createMockFriends(3));
      });

      it('친구 리스트가 표시된다', async () => {
        const { findByText } = render(<FriendPage />);

        expect(await findByText('friend1')).toBeOnTheScreen();
        expect(await findByText('friend2')).toBeOnTheScreen();
        expect(await findByText('friend3')).toBeOnTheScreen();
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
  });

  describe('친구 검색 테스트', () => {
    it('검색어 입력 후 엔터를 누르면 해당 키워드를 포함하는 친구만 표시된다', async () => {
      const allFriends = createMockFriends(3);

      mockAxios
        .onGet(/\/friends\/requests/)
        .reply(200, wrapResponse(createMockFriendRequestResponse(1)));
      mockAxios.onGet(/\/friends/).reply((config) => {
        if (config.url?.includes('/requests')) {
          return [200, wrapResponse(createMockFriendRequestResponse(1))];
        }
        if (config.url?.includes('nickname=friend2')) {
          return [200, wrapResponse([allFriends[1]])];
        }
        return [200, wrapResponse(allFriends)];
      });

      const { findByText, getByPlaceholderText, queryByText } = render(
        <FriendPage />,
      );

      expect(await findByText('friend1')).toBeOnTheScreen();

      const searchInput = getByPlaceholderText('이름을 입력해주세요.');

      fireEvent.changeText(searchInput, 'friend2');
      fireEvent(searchInput, 'submitEditing');

      expect(await findByText('friend2')).toBeOnTheScreen();

      await waitFor(() => {
        expect(queryByText('friend1')).not.toBeOnTheScreen();
        expect(queryByText('friend3')).not.toBeOnTheScreen();
      });
    });
  });

  describe('친구 삭제 테스트', () => {
    beforeEach(() => {
      setupMocks(createMockFriends(3));
    });

    it('삭제 버튼 클릭 시 확인 Alert이 표시된다', async () => {
      // eslint-disable-next-line camelcase
      const { findByText, UNSAFE_getAllByType } = render(<FriendPage />);

      expect(await findByText('friend1')).toBeOnTheScreen();

      const pressables = UNSAFE_getAllByType(Pressable);

      // 삭제 버튼 찾기: 모든 Pressable을 순회하면서 Alert.alert를 호출하는 버튼 찾기
      for (let i = 0; i < pressables.length; i++) {
        fireEvent.press(pressables[i]);

        if ((Alert.alert as jest.Mock).mock.calls.length > 0) {
          break;
        }
      }

      expect(Alert.alert).toHaveBeenCalledWith(
        '친구 삭제',
        expect.stringContaining('님을 친구 목록에서 삭제하시겠습니까?'),
        expect.arrayContaining([
          expect.objectContaining({ text: '취소', style: 'cancel' }),
          expect.objectContaining({ text: '삭제', style: 'destructive' }),
        ]),
      );
    });
  });
});
