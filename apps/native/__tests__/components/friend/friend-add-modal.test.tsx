import { Pressable } from 'react-native';
import axiosInstance from '@repo/shared/api';
import MockAdapter from 'axios-mock-adapter';

import FriendAddModal from '../../../components/friend/FriendAddModal';
import {
  act,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../../setup/auth-test-utils';
import { createMockUsers } from '../../setup/user/mock';

// global mock 타입 선언
declare const mockShowToast: jest.Mock;

let mockAxios: MockAdapter;

// axios response interceptor가 response.data.data를 반환하므로
// { data: [...] } 형태로 감싸야 함
const wrapResponse = <T,>(data: T) => ({ data });

// 기본 Props
const defaultProps = {
  visible: true,
  onClose: jest.fn(),
};

describe('친구 추가 모달', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockShowToast.mockClear();
    defaultProps.onClose.mockClear();
  });

  afterEach(async () => {
    mockAxios.restore();
    await act(async () => {});
  });

  describe('모달 표시 테스트', () => {
    it('visible이 true일 때 모달이 표시된다', async () => {
      const { findByText } = render(<FriendAddModal {...defaultProps} />);

      expect(await findByText('친구 추가')).toBeOnTheScreen();
    });

    it('visible이 false일 때 모달이 표시되지 않는다', async () => {
      const { queryByText } = render(
        <FriendAddModal {...defaultProps} visible={false} />,
      );

      await waitFor(() => {
        expect(queryByText('친구 추가')).not.toBeOnTheScreen();
      });
    });
  });

  describe('유저 검색 테스트', () => {
    describe('검색어를 입력하지 않은 경우', () => {
      it('유저 리스트가 표시되지 않고 빈 상태 메시지가 표시된다', async () => {
        const { findByText } = render(<FriendAddModal {...defaultProps} />);

        expect(await findByText('유저가 존재하지 않습니다.')).toBeOnTheScreen();
      });
    });

    describe('검색어를 입력한 경우', () => {
      beforeEach(() => {
        // 검색 API mock - 여러 유저 반환 (포함관계로 여러개 반환)
        mockAxios.onGet(/\/users\/search/).reply((config) => {
          const keyword = config.url?.match(/nickname=([^&]*)/)?.[1] || '';

          if (keyword === 'user') {
            // 'user' 키워드로 검색 시 user1, user2, user3 반환
            return [200, wrapResponse(createMockUsers(3))];
          }

          return [200, wrapResponse([])];
        });
      });

      it('검색어를 포함하는 유저 리스트가 표시된다', async () => {
        const { findByText, getByPlaceholderText } = render(
          <FriendAddModal {...defaultProps} />,
        );

        const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

        fireEvent.changeText(searchInput, 'user');
        fireEvent(searchInput, 'submitEditing');

        // 포함관계로 여러 유저가 표시됨
        expect(await findByText('user1')).toBeOnTheScreen();
        expect(await findByText('user2')).toBeOnTheScreen();
        expect(await findByText('user3')).toBeOnTheScreen();
      });

      it('검색 결과가 없으면 빈 상태 메시지가 표시된다', async () => {
        const { findByText, getByPlaceholderText } = render(
          <FriendAddModal {...defaultProps} />,
        );

        const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

        fireEvent.changeText(searchInput, 'nonexistent');
        fireEvent(searchInput, 'submitEditing');

        expect(await findByText('유저가 존재하지 않습니다.')).toBeOnTheScreen();
      });
    });
  });

  describe('친구 추가 버튼 클릭 테스트', () => {
    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios
          .onGet(/\/users\/search/)
          .reply(200, wrapResponse(createMockUsers(1)));
        mockAxios.onPost('/friends/requests').reply(
          200,
          wrapResponse({
            id: 1,
            senderNickname: 'testuser',
            receiverNickname: 'user1',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          }),
        );
      });

      it('성공 토스트가 표시되고 모달이 닫힌다', async () => {
        // eslint-disable-next-line camelcase
        const { findByText, getByPlaceholderText, UNSAFE_getAllByType } =
          render(<FriendAddModal {...defaultProps} />);

        // 검색 실행
        const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

        fireEvent.changeText(searchInput, 'user');
        fireEvent(searchInput, 'submitEditing');

        // 유저가 표시될 때까지 대기
        expect(await findByText('user1')).toBeOnTheScreen();

        // 추가 버튼 클릭 (+ 아이콘 버튼)
        // Pressable 중 마지막이 추가 버튼 (overlay, modal container, close button, add button 순서)
        const pressables = UNSAFE_getAllByType(Pressable);
        const addButton = pressables[pressables.length - 1];

        fireEvent.press(addButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '친구 요청을 보냈습니다.',
            'success',
          );
          expect(defaultProps.onClose).toHaveBeenCalled();
        });
      });
    });

    describe('이미 대기 중인 친구 요청이 있는 경우', () => {
      beforeEach(() => {
        mockAxios
          .onGet(/\/users\/search/)
          .reply(200, wrapResponse(createMockUsers(1)));
        mockAxios.onPost('/friends/requests').reply(400, {
          error: {
            message: '이미 대기 중인 친구 요청이 있습니다.',
          },
        });
      });

      it('에러 토스트가 표시된다', async () => {
        // eslint-disable-next-line camelcase
        const { findByText, getByPlaceholderText, UNSAFE_getAllByType } =
          render(<FriendAddModal {...defaultProps} />);

        const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

        fireEvent.changeText(searchInput, 'user');
        fireEvent(searchInput, 'submitEditing');

        expect(await findByText('user1')).toBeOnTheScreen();

        const pressables = UNSAFE_getAllByType(Pressable);
        const addButton = pressables[pressables.length - 1];

        fireEvent.press(addButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '이미 대기 중인 친구 요청이 있습니다.',
            'error',
          );
        });
      });
    });

    describe('이미 친구 관계인 경우', () => {
      beforeEach(() => {
        mockAxios
          .onGet(/\/users\/search/)
          .reply(200, wrapResponse(createMockUsers(1)));
        mockAxios.onPost('/friends/requests').reply(400, {
          error: {
            message: '이미 친구 관계입니다.',
          },
        });
      });

      it('에러 토스트가 표시된다', async () => {
        // eslint-disable-next-line camelcase
        const { findByText, getByPlaceholderText, UNSAFE_getAllByType } =
          render(<FriendAddModal {...defaultProps} />);

        const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

        fireEvent.changeText(searchInput, 'user');
        fireEvent(searchInput, 'submitEditing');

        expect(await findByText('user1')).toBeOnTheScreen();

        const pressables = UNSAFE_getAllByType(Pressable);
        const addButton = pressables[pressables.length - 1];

        fireEvent.press(addButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '이미 친구 관계입니다.',
            'error',
          );
        });
      });
    });

    describe('알 수 없는 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios
          .onGet(/\/users\/search/)
          .reply(200, wrapResponse(createMockUsers(1)));
        mockAxios.onPost('/friends/requests').reply(500);
      });

      it('기본 에러 메시지가 표시된다', async () => {
        // eslint-disable-next-line camelcase
        const { findByText, getByPlaceholderText, UNSAFE_getAllByType } =
          render(<FriendAddModal {...defaultProps} />);

        const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

        fireEvent.changeText(searchInput, 'user');
        fireEvent(searchInput, 'submitEditing');

        expect(await findByText('user1')).toBeOnTheScreen();

        const pressables = UNSAFE_getAllByType(Pressable);
        const addButton = pressables[pressables.length - 1];

        fireEvent.press(addButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '친구 추가에 실패했습니다. 다시 시도해주세요.',
            'error',
          );
        });
      });
    });
  });

  describe('모달 닫기 테스트', () => {
    it('X 버튼 클릭 시 모달이 닫힌다', async () => {
      // eslint-disable-next-line camelcase
      const { findByText, UNSAFE_getAllByType } = render(
        <FriendAddModal {...defaultProps} />,
      );

      expect(await findByText('친구 추가')).toBeOnTheScreen();

      // Pressable 순서: overlay, modal container, close button
      // close button은 세 번째 Pressable (index 2)
      const pressables = UNSAFE_getAllByType(Pressable);
      const closeButton = pressables[2];

      fireEvent.press(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('overlay 클릭 시 모달이 닫힌다', async () => {
      // eslint-disable-next-line camelcase
      const { findByText, UNSAFE_getAllByType } = render(
        <FriendAddModal {...defaultProps} />,
      );

      expect(await findByText('친구 추가')).toBeOnTheScreen();

      // overlay는 첫 번째 Pressable (index 0)
      const pressables = UNSAFE_getAllByType(Pressable);
      const overlay = pressables[0];

      fireEvent.press(overlay);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('입력값 초기화 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/users\/search/)
        .reply(200, wrapResponse(createMockUsers(1)));
    });

    it('모달을 닫으면 입력값이 초기화된다', async () => {
      // eslint-disable-next-line camelcase
      const {
        findByText,
        getByPlaceholderText,
        // eslint-disable-next-line camelcase
        UNSAFE_getAllByType,
        rerender,
      } = render(<FriendAddModal {...defaultProps} />);

      // 검색어 입력
      const searchInput = getByPlaceholderText('유저이름을 입력해주세요.');

      fireEvent.changeText(searchInput, 'user');
      fireEvent(searchInput, 'submitEditing');

      expect(await findByText('user1')).toBeOnTheScreen();

      // X 버튼 클릭으로 닫기 (close button은 index 2)
      const pressables = UNSAFE_getAllByType(Pressable);

      fireEvent.press(pressables[2]);

      // 모달 다시 열기
      rerender(<FriendAddModal {...defaultProps} visible={true} />);

      // 검색어가 초기화되어 빈 상태 메시지가 표시됨
      expect(await findByText('유저가 존재하지 않습니다.')).toBeOnTheScreen();
    });
  });
});
