import axiosInstance from '@repo/shared/api';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import type { RoutineChangeRequest } from '@repo/types';
import MockAdapter from 'axios-mock-adapter';

import RequestListModal from '../../../components/modal/request-list-modal';
import {
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../../setup/auth-test-utils';
import { createMockRequestList } from '../../setup/request/mock';

jest.mock('@/components/ui/flash-list', () => {
  const { View } = require('react-native');

  return {
    FlashList: ({
      data,
      renderItem,
    }: {
      data: Array<{ id?: number }>;
      renderItem: (args: { item: any; index: number }) => React.ReactNode;
    }) => (
      <View>
        {data.map((item: any, index: number) => (
          <View key={item.id ?? index}>{renderItem({ item, index })}</View>
        ))}
      </View>
    ),
  };
});

jest.mock('@repo/shared/hooks/useUser', () => ({
  useFetchMeQuery: jest.fn(),
}));

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
declare const mockShowToast: jest.Mock;

// requestStore mock
const mockSetRequestId = jest.fn();

jest.mock('@/store/request.store', () => ({
  useRequestStore: (selector: (state: any) => any) =>
    selector({
      requestId: 0,
      setRequestId: mockSetRequestId,
    }),
}));

const mockUseReceivedRequests = jest.fn();
const RECEIVED_CHANGE_REQUESTS_URL = '/routine/change-requests/received';

const createRoutineChangeRequest = (
  id: number,
  overrides: Partial<RoutineChangeRequest> = {},
): RoutineChangeRequest => ({
  id,
  routineId: id,
  routineName: '아침 운동',
  requesterId: 1,
  requesterNickname: '윤윤',
  approverId: 2,
  approverNickname: '맨날12',
  status: 'PENDING',
  requestedRoutineName: '아침 운동 강화',
  requestedRoutineDetail: null,
  requestedRoutineCount: 5,
  requestedStartDate: null,
  requestedEndDate: null,
  requestedPenalty: null,
  requestedMateId: null,
  requestedMateNickname: null,
  requestedCategory: '운동',
  requestedSymbolColor: null,
  requestedHidden: null,
  requestedPaused: null,
  before: {
    routineName: '아침 운동',
    routineDetail: '30분 걷기',
    routineCount: 3,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    penalty: 1000,
    mateId: 2,
    mateNickname: '맨날12',
    category: '기본',
    symbolColor: '#111111',
    hidden: false,
    paused: false,
  },
  after: {
    routineName: '아침 운동 강화',
    routineDetail: '30분 걷기',
    routineCount: 5,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    penalty: 1000,
    mateId: 2,
    mateNickname: '맨날12',
    category: '운동',
    symbolColor: '#111111',
    hidden: false,
    paused: false,
  },
  changes: [
    {
      field: 'routineName',
      label: '루틴명',
      before: '아침 운동',
      after: '아침 운동 강화',
    },
    {
      field: 'routineCount',
      label: '주간 목표 횟수',
      before: 3,
      after: 5,
    },
    {
      field: 'category',
      label: '카테고리',
      before: '기본',
      after: '운동',
    },
  ],
  rejectReason: null,
  requestedAt: '2026-07-09T12:00:00',
  respondedAt: null,
  expiresAt: '2026-07-16',
  ...overrides,
});

const mockRoutineChangeRequests = [
  createRoutineChangeRequest(101, {
    routineName: '독서 루틴',
    requesterNickname: '지혜',
    requestedRoutineName: '독서 집중 루틴',
    requestedAt: '2026-07-10T12:00:00',
    expiresAt: '2026-07-18',
    changes: [
      {
        field: 'routineName',
        label: '루틴명',
        before: '독서 루틴',
        after: '독서 집중 루틴',
      },
      {
        field: 'routineCount',
        label: '주간 목표 횟수',
        before: 4,
        after: 6,
      },
    ],
  }),
  createRoutineChangeRequest(102, {
    routineName: '영어 공부',
    requesterNickname: '민수',
    requestedRoutineName: null,
    requestedAt: '2026-07-08T12:00:00',
    expiresAt: '2026-07-20',
    changes: [
      {
        field: 'routineCount',
        label: '주간 목표 횟수',
        before: 3,
        after: 5,
      },
    ],
  }),
  createRoutineChangeRequest(100),
];

let mockAxios: MockAdapter;

jest.mock('@/hooks/useReceivedRequests', () => ({
  useReceivedRequests: (nickname: string) => mockUseReceivedRequests(nickname),
}));

describe('RequestListModal (받은 요청 확인 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet(RECEIVED_CHANGE_REQUESTS_URL).reply(200, { data: [] });
    mockPush.mockClear();
    mockShowToast.mockClear();
    mockSetRequestId.mockClear();
    mockUseReceivedRequests.mockClear();
    (useFetchMeQuery as jest.Mock).mockReturnValue({
      data: {
        userId: 'test123',
        nickname: 'testuser',
        motto: null,
        mottos: [],
        role: 'USER',
        characterImageUrl: 'https://cdn.example.com/characters/warrior.png',
        backgroundImageUrl: 'https://cdn.example.com/backgrounds/warrior.webp',
      },
    });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('인증 요청 리스트 표시 테스트', () => {
    describe('인증 요청이 있는 경우', () => {
      beforeEach(() => {
        const mockRequests = createMockRequestList(3, {
          routineName: '아침 운동',
          nickname: 'friend1',
        });

        mockUseReceivedRequests.mockReturnValue({
          data: mockRequests,
        });
        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: mockRoutineChangeRequests });
      });

      it('인증 요청 리스트가 화면에 표시된다', async () => {
        const { findAllByText, findByText } = render(<RequestListModal />);

        const routineItems = await findAllByText('아침 운동');

        expect(routineItems.length).toBe(3);
        expect(routineItems[0]).toBeOnTheScreen();
        expect(
          await findByText('도착한 요청을 확인해 주세요'),
        ).toBeOnTheScreen();
        expect(await findByText('오늘')).toBeOnTheScreen();
      });

      it('받은 요청 개요와 요청 유형 탭을 표시한다', async () => {
        const { findByRole, findByText } = render(<RequestListModal />);

        const [heading, confirmationTab, routineChangeTab] = await Promise.all([
          findByText('받은 요청'),
          findByRole('tab', { name: '인증 요청 3건' }),
          findByRole('tab', { name: '루틴 수정 3건' }),
        ]);

        expect(heading).toBeOnTheScreen();
        expect(confirmationTab).toHaveProp('accessibilityState', {
          selected: true,
        });
        expect(routineChangeTab).toHaveProp('accessibilityState', {
          selected: false,
        });
      });

      it('GET /users/me의 캐릭터 URL을 받은 요청 캐릭터로 표시한다', async () => {
        const { findByTestId } = render(<RequestListModal />);

        expect(await findByTestId('request-list-character')).toHaveProp(
          'source',
          { uri: 'https://cdn.example.com/characters/warrior.png' },
        );
      });

      it('루틴 수정 탭을 선택하면 변경 요청 목록과 펼친 상세를 표시한다', async () => {
        const { findByRole, findByText, queryByText } = render(
          <RequestListModal />,
        );

        const routineChangeTab = await findByRole('tab', {
          name: '루틴 수정 3건',
        });

        fireEvent.press(routineChangeTab);

        await waitFor(() => {
          expect(routineChangeTab).toHaveProp('accessibilityState', {
            selected: true,
          });
          expect(queryByText('friend1')).toBeNull();
        });
        expect(await findByText('독서 루틴')).toBeOnTheScreen();
        expect(await findByText('영어 공부')).toBeOnTheScreen();
        expect(await findByText('변경 내용')).toBeOnTheScreen();
        expect(await findByText('아침 운동 강화')).toBeOnTheScreen();
        expect(await findByText('주 5회')).toBeOnTheScreen();
        expect(await findByText('2026년 7월 9일 (목)')).toBeOnTheScreen();
        expect(
          await findByText('· 2026년 7월 16일 (목)까지'),
        ).toBeOnTheScreen();
        expect(await findByRole('button', { name: '거절' })).toBeOnTheScreen();
        expect(await findByRole('button', { name: '승인' })).toBeOnTheScreen();
      });

      it('받은 루틴 변경 요청 API 응답을 목록에 표시한다', async () => {
        const serverRequest = createRoutineChangeRequest(200, {
          routineName: '서버 루틴',
          requesterNickname: '서버 메이트',
          requestedRoutineName: '서버 루틴 변경안',
          changes: [
            {
              field: 'routineName',
              label: '루틴명',
              before: '서버 루틴',
              after: '서버 루틴 변경안',
            },
          ],
        });

        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: [serverRequest] });

        const { findByRole, findByText } = render(<RequestListModal />);

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 1건',
          }),
        );

        expect(
          await findByRole('button', {
            name: '서버 루틴 변경 요청 접기',
          }),
        ).toBeOnTheScreen();
        expect(await findByText('서버 루틴 변경안')).toBeOnTheScreen();
        expect(mockAxios.history.get[0]?.url).toBe(
          RECEIVED_CHANGE_REQUESTS_URL,
        );
      });

      it('색상 변경은 헥스 문자열 대신 실제 컬러로 표시한다', async () => {
        const colorChangeRequest = createRoutineChangeRequest(201, {
          routineName: '컬러 루틴',
          changes: [
            {
              field: 'symbolColor',
              label: '루틴 컬러',
              before: '#111111',
              after: '#00D68F',
            },
          ],
        });

        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: [colorChangeRequest] });

        const { findByRole, findByTestId, queryByText } = render(
          <RequestListModal />,
        );

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 1건',
          }),
        );

        expect(await findByTestId('routine-change-before-color')).toHaveStyle({
          backgroundColor: '#111111',
        });
        expect(await findByTestId('routine-change-after-color')).toHaveStyle({
          backgroundColor: '#00D68F',
        });
        expect(queryByText('#111111')).toBeNull();
        expect(queryByText('#00D68F')).toBeNull();
      });

      it('표시할 수 없는 색상 값은 텍스트로 유지한다', async () => {
        const invalidColorChangeRequest = createRoutineChangeRequest(202, {
          routineName: '잘못된 컬러 루틴',
          changes: [
            {
              field: 'symbolColor',
              label: '루틴 컬러',
              before: null,
              after: 'invalid-color',
            },
          ],
        });

        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: [invalidColorChangeRequest] });

        const { findByRole, findByText, queryByTestId } = render(
          <RequestListModal />,
        );

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 1건',
          }),
        );

        expect(await findByText('없음')).toBeOnTheScreen();
        expect(await findByText('invalid-color')).toBeOnTheScreen();
        expect(queryByTestId('routine-change-before-color')).toBeNull();
        expect(queryByTestId('routine-change-after-color')).toBeNull();
      });

      it('변경 사항 아래의 구분선을 연한 블루 톤으로 표시한다', async () => {
        const { findAllByTestId, findByRole } = render(<RequestListModal />);

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 3건',
          }),
        );

        const changeRows = await findAllByTestId('routine-change-row');

        expect(changeRows).toHaveLength(3);
        for (const changeRow of changeRows) {
          expect(changeRow).toHaveStyle({
            borderBottomColor: 'rgb(222, 236, 249)',
          });
        }
      });

      it('다른 변경 요청을 누르면 해당 요청의 상세만 펼친다', async () => {
        const { findByRole, findByText, queryByText } = render(
          <RequestListModal />,
        );

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 3건',
          }),
        );
        fireEvent.press(await findByRole('button', { name: /독서 루틴/ }));

        expect(await findByText('독서 집중 루틴')).toBeOnTheScreen();
        expect(queryByText('아침 운동 강화')).toBeNull();
      });

      it('변경 요청을 승인하면 항목과 루틴 수정 카운트를 갱신한다', async () => {
        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .replyOnce(200, { data: mockRoutineChangeRequests })
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: mockRoutineChangeRequests.slice(0, 2) });
        mockAxios
          .onPost('/routine/change-requests/100/approve')
          .reply(200, { data: null });

        const { findByRole, queryAllByText } = render(<RequestListModal />);

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 3건',
          }),
        );
        fireEvent.press(await findByRole('button', { name: '승인' }));

        await waitFor(() => {
          expect(queryAllByText('아침 운동', { exact: true })).toHaveLength(0);
        });
        expect(
          await findByRole('tab', { name: '루틴 수정 2건' }),
        ).toBeOnTheScreen();
        expect(mockAxios.history.post[0]?.url).toBe(
          '/routine/change-requests/100/approve',
        );
        expect(mockShowToast).toHaveBeenCalledWith(
          '루틴 수정 요청을 승인했습니다.',
          'success',
        );
      });

      it('변경 요청을 거절하면 항목과 루틴 수정 카운트를 갱신한다', async () => {
        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .replyOnce(200, { data: mockRoutineChangeRequests })
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: mockRoutineChangeRequests.slice(0, 2) });
        mockAxios
          .onPost('/routine/change-requests/100/reject')
          .reply(200, { data: null });

        const { findByRole, queryAllByText } = render(<RequestListModal />);

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 3건',
          }),
        );
        fireEvent.press(await findByRole('button', { name: '거절' }));

        await waitFor(() => {
          expect(queryAllByText('아침 운동', { exact: true })).toHaveLength(0);
        });
        expect(
          await findByRole('tab', { name: '루틴 수정 2건' }),
        ).toBeOnTheScreen();
        expect(mockAxios.history.post[0]?.url).toBe(
          '/routine/change-requests/100/reject',
        );
        expect(mockAxios.history.post[0]?.data).toBe('{}');
        expect(mockShowToast).toHaveBeenCalledWith(
          '루틴 수정 요청을 거절했습니다.',
          'success',
        );
      });

      it('루틴 변경 요청 조회에 실패하면 다시 시도한다', async () => {
        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .replyOnce(500, {})
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: mockRoutineChangeRequests });

        const { findByRole, findByText } = render(<RequestListModal />);

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 0건',
          }),
        );

        expect(
          await findByText('요청을 불러오지 못했습니다.'),
        ).toBeOnTheScreen();

        fireEvent.press(await findByRole('button', { name: '다시 시도' }));

        expect(
          await findByRole('tab', { name: '루틴 수정 3건' }),
        ).toBeOnTheScreen();
      });

      it('루틴 변경 요청 승인에 실패하면 항목을 유지한다', async () => {
        mockAxios.resetHandlers();
        mockAxios
          .onGet(RECEIVED_CHANGE_REQUESTS_URL)
          .reply(200, { data: mockRoutineChangeRequests });
        mockAxios.onPost('/routine/change-requests/100/approve').reply(500, {});

        const { findByRole } = render(<RequestListModal />);

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 3건',
          }),
        );
        fireEvent.press(await findByRole('button', { name: '승인' }));

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '루틴 수정 요청 승인에 실패했습니다. 다시 시도해주세요.',
            'error',
          );
        });
        expect(
          await findByRole('tab', { name: '루틴 수정 3건' }),
        ).toBeOnTheScreen();
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

        mockUseReceivedRequests.mockReturnValue({
          data: mockRequests,
        });

        const { findByText } = render(<RequestListModal />);

        // getFormatDate 함수가 날짜를 포맷팅함
        expect(await findByText(/2024/)).toBeOnTheScreen();
      });
    });

    describe('인증 요청이 없는 경우', () => {
      beforeEach(() => {
        mockUseReceivedRequests.mockReturnValue({
          data: [],
        });
      });

      it('"요청이 없습니다." 메시지가 표시된다', async () => {
        const { findByText } = render(<RequestListModal />);

        expect(await findByText('요청이 없습니다.')).toBeOnTheScreen();
      });

      it('서버에 루틴 수정 요청이 없으면 빈 목록을 표시한다', async () => {
        const { findByRole, findByText, queryByText } = render(
          <RequestListModal />,
        );

        fireEvent.press(
          await findByRole('tab', {
            name: '루틴 수정 0건',
          }),
        );

        expect(await findByText('요청이 없습니다.')).toBeOnTheScreen();
        expect(queryByText('아침 운동 강화')).toBeNull();
      });
    });
  });

  describe('인증 요청 리스트 아이템 클릭 테스트', () => {
    beforeEach(() => {
      const mockRequests = createMockRequestList(2);

      mockUseReceivedRequests.mockReturnValue({
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

      mockUseReceivedRequests.mockReturnValue({
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

      mockUseReceivedRequests.mockReturnValue({
        data: mockRequests,
      });

      const { findByText } = render(<RequestListModal />);

      expect(await findByText('alice')).toBeOnTheScreen();
      expect(await findByText('bob')).toBeOnTheScreen();
    });
  });
});
