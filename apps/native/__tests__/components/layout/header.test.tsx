import Header from '../../../components/layout/Header';
import { render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRequestList } from '../../setup/request/mock';

// useRequest hook mock
const mockUseFetchReceivedRequestsQuery = jest.fn();

jest.mock('@repo/shared/hooks/useRequest', () => ({
  useFetchReceivedRequestsQuery: (nickname: string) =>
    mockUseFetchReceivedRequestsQuery(nickname),
}));

describe('Header 컴포넌트', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockUseFetchReceivedRequestsQuery.mockClear();
  });

  describe('메이트 인증 요청 카운트 표시 테스트', () => {
    describe('인증 요청이 없는 경우', () => {
      beforeEach(() => {
        mockUseFetchReceivedRequestsQuery.mockReturnValue({
          data: [],
        });
      });

      it('벨 아이콘에 카운트가 표시되지 않는다', async () => {
        const { findByLabelText, queryByText } = render(<Header />);

        expect(await findByLabelText('인증 요청 알림')).toBeOnTheScreen();
        // 카운트 숫자가 표시되지 않음
        expect(queryByText('0')).not.toBeOnTheScreen();
      });
    });

    describe('인증 요청이 있는 경우', () => {
      const requestCount = 3;

      beforeEach(() => {
        mockUseFetchReceivedRequestsQuery.mockReturnValue({
          data: createMockRequestList(requestCount),
        });
      });

      it('벨 아이콘에 인증 요청 카운트가 표시된다', async () => {
        const { findByLabelText, findByText } = render(<Header />);

        expect(
          await findByLabelText(`인증 요청 알림 ${requestCount}건`),
        ).toBeOnTheScreen();
        expect(await findByText(String(requestCount))).toBeOnTheScreen();
      });
    });

    describe('인증 요청이 1건인 경우', () => {
      beforeEach(() => {
        mockUseFetchReceivedRequestsQuery.mockReturnValue({
          data: createMockRequestList(1),
        });
      });

      it('벨 아이콘에 1건이 표시된다', async () => {
        const { findByLabelText, findByText } = render(<Header />);

        expect(await findByLabelText('인증 요청 알림 1건')).toBeOnTheScreen();
        expect(await findByText('1')).toBeOnTheScreen();
      });
    });
  });
});
