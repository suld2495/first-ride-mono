import RequestListModal from '../../../components/modal/RequestListModal';
import {
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../../setup/auth-test-utils';
import { createMockRequestList } from '../../setup/request/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;

// requestStore mock
const mockSetRequestId = jest.fn();

jest.mock('@repo/shared/store/request.store', () => ({
  useRequestStore: (selector: (state: any) => any) =>
    selector({
      requestId: 0,
      setRequestId: mockSetRequestId,
    }),
}));

// useRequest hook mock
const mockUseFetchReceivedRequestsQuery = jest.fn();

jest.mock('@repo/shared/hooks/useRequest', () => ({
  useFetchReceivedRequestsQuery: (nickname: string) =>
    mockUseFetchReceivedRequestsQuery(nickname),
}));

describe('RequestListModal (인증 요청 확인 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockPush.mockClear();
    mockSetRequestId.mockClear();
    mockUseFetchReceivedRequestsQuery.mockClear();
  });

  describe('인증 요청 리스트 표시 테스트', () => {
    describe('인증 요청이 있는 경우', () => {
      beforeEach(() => {
        const mockRequests = createMockRequestList(3, {
          routineName: '아침 운동',
          nickname: 'friend1',
        });

        mockUseFetchReceivedRequestsQuery.mockReturnValue({
          data: mockRequests,
        });
      });

      it('인증 요청 리스트가 화면에 표시된다', async () => {
        const { findAllByText } = render(<RequestListModal />);

        const routineItems = await findAllByText('아침 운동');

        expect(routineItems.length).toBe(3);
        expect(routineItems[0]).toBeOnTheScreen();
      });

      it('요청한 사람의 닉네임이 표시된다', async () => {
        const { findAllByText } = render(<RequestListModal />);

        const nicknameElements = await findAllByText('friend1');

        expect(nicknameElements.length).toBeGreaterThan(0);
      });

      it('요청 날짜가 표시된다', async () => {
        const mockRequests = createMockRequestList(1, {
          routineName: '아침 운동',
          createdAt: '2024-01-15T10:00:00.000Z',
        });

        mockUseFetchReceivedRequestsQuery.mockReturnValue({
          data: mockRequests,
        });

        const { findByText } = render(<RequestListModal />);

        // getFormatDate 함수가 날짜를 포맷팅함
        expect(await findByText(/2024/)).toBeOnTheScreen();
      });
    });

    describe('인증 요청이 없는 경우', () => {
      beforeEach(() => {
        mockUseFetchReceivedRequestsQuery.mockReturnValue({
          data: [],
        });
      });

      it('"요청이 없습니다." 메시지가 표시된다', async () => {
        const { findByText } = render(<RequestListModal />);

        expect(await findByText('요청이 없습니다.')).toBeOnTheScreen();
      });
    });
  });

  describe('인증 요청 리스트 아이템 클릭 테스트', () => {
    beforeEach(() => {
      const mockRequests = createMockRequestList(2);

      mockUseFetchReceivedRequestsQuery.mockReturnValue({
        data: mockRequests,
      });
    });

    it('리스트 아이템을 클릭하면 상세 모달 페이지로 이동한다', async () => {
      const { findByText } = render(<RequestListModal />);

      const firstItem = await findByText('테스트 루틴 1');

      fireEvent.press(firstItem);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/modal?type=request-detail');
      });
    });

    it('리스트 아이템을 클릭하면 해당 requestId가 store에 저장된다', async () => {
      const { findByText } = render(<RequestListModal />);

      const firstItem = await findByText('테스트 루틴 1');

      fireEvent.press(firstItem);

      await waitFor(() => {
        expect(mockSetRequestId).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('여러 인증 요청이 있는 경우', () => {
    it('모든 인증 요청이 리스트에 표시된다', async () => {
      const mockRequests = [
        {
          id: 1,
          routineName: '아침 운동',
          nickname: 'user1',
          mateNickname: 'mate1',
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        {
          id: 2,
          routineName: '독서하기',
          nickname: 'user2',
          mateNickname: 'mate2',
          createdAt: '2024-01-16T10:00:00.000Z',
        },
        {
          id: 3,
          routineName: '물 마시기',
          nickname: 'user3',
          mateNickname: 'mate3',
          createdAt: '2024-01-17T10:00:00.000Z',
        },
      ];

      mockUseFetchReceivedRequestsQuery.mockReturnValue({
        data: mockRequests,
      });

      const { findByText } = render(<RequestListModal />);

      expect(await findByText('아침 운동')).toBeOnTheScreen();
      expect(await findByText('독서하기')).toBeOnTheScreen();
      expect(await findByText('물 마시기')).toBeOnTheScreen();
    });

    it('각 요청에 대한 닉네임이 올바르게 표시된다', async () => {
      const mockRequests = [
        {
          id: 1,
          routineName: '아침 운동',
          nickname: 'alice',
          mateNickname: 'mate1',
          createdAt: '2024-01-15T10:00:00.000Z',
        },
        {
          id: 2,
          routineName: '독서하기',
          nickname: 'bob',
          mateNickname: 'mate2',
          createdAt: '2024-01-16T10:00:00.000Z',
        },
      ];

      mockUseFetchReceivedRequestsQuery.mockReturnValue({
        data: mockRequests,
      });

      const { findByText } = render(<RequestListModal />);

      expect(await findByText('alice')).toBeOnTheScreen();
      expect(await findByText('bob')).toBeOnTheScreen();
    });
  });
});
