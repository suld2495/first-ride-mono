import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import * as Notifications from 'expo-notifications';
import { Alert, type AlertButton } from 'react-native';

import RequestDetailModal from '../../../components/modal/request-detail-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutineDetail } from '../../setup/routine/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockBack: jest.Mock;
declare const mockRequestStore: {
  requestId: number;
  setRequestId: jest.Mock;
};
declare const mockShowToast: jest.Mock;

// axios mock adapter
let mockAxios: MockAdapter;
const mockAlert = jest.spyOn(Alert, 'alert');
const pressAlertButton = (label: string) => {
  const buttons = mockAlert.mock.calls.at(-1)?.[2];
  const button = buttons?.find(
    (alertButton: AlertButton) => alertButton.text === label,
  );

  button?.onPress?.();
};

describe('RequestDetailModal (루틴 인증 요청 상세 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockRequestStore.requestId = 1;
    mockShowToast.mockClear();
    mockBack.mockClear();
    mockAlert.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('루틴 정보 표시 테스트', () => {
    beforeEach(() => {
      const mockDetail = createMockRoutineDetail(0, {
        routineName: '매일 운동하기',
        routineDetail: '30분 이상 운동',
        createdAt: '2025-01-15T10:05:09',
      });

      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });
    });

    it('루틴 이름이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('매일 운동하기')).toBeOnTheScreen();
      expect(await findByText('메이트가 보낸 인증이에요')).toBeOnTheScreen();
    });

    it('루틴 상세 설명이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('30분 이상 운동')).toBeOnTheScreen();
    });

    it('날짜가 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('2025-01-15 10:05:09')).toBeOnTheScreen();
    });

    it('생성일이 없어도 상세 화면을 표시한다', async () => {
      const mockDetail = {
        ...createMockRoutineDetail(0),
        createdAt: '',
      };
      mockAxios.resetHandlers();
      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });

      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
    });

    it('루틴 이름 라벨이 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('루틴 이름')).toBeOnTheScreen();
    });

    it('인증 이미지 경로가 없어도 상세 정보를 표시한다', async () => {
      const mockDetail = {
        ...createMockRoutineDetail(0),
        imagePath: '',
      };
      mockAxios.resetHandlers();
      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });

      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
    });

    it('응원의 한마디 입력 항목을 표시한다', async () => {
      const { findByText, getByLabelText, getByPlaceholderText } = render(
        <RequestDetailModal />,
      );

      await findByText('메이트가 보낸 인증이에요');

      expect(getByLabelText('응원의 한마디')).toBeOnTheScreen();
      expect(
        getByPlaceholderText('응원의 한마디를 입력해주세요.'),
      ).toBeOnTheScreen();
    });

    it('인증 요청 메시지가 있으면 상세 화면에 표시한다', async () => {
      const mockDetail = createMockRoutineDetail(0, {
        message: '오늘은 30분 뛰었어!',
      });
      mockAxios.resetHandlers();
      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });

      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('메이트의 한마디')).toBeOnTheScreen();
      expect(await findByText('오늘은 30분 뛰었어!')).toBeOnTheScreen();
    });

    it('인증 요청 메시지가 없으면 기존 상세 화면만 표시한다', async () => {
      const mockDetail = createMockRoutineDetail(0, { message: null });
      mockAxios.resetHandlers();
      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });

      const { findByText, queryByTestId } = render(<RequestDetailModal />);

      await findByText('테스트 루틴 1');
      expect(queryByTestId('request-detail-message')).toBeNull();
    });
  });

  describe('승인/거절 버튼 테스트', () => {
    beforeEach(() => {
      const mockDetail = createMockRoutineDetail(0);

      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });
    });

    it('승인 버튼이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('승인')).toBeOnTheScreen();
    });

    it('거절 버튼이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('거절')).toBeOnTheScreen();
    });

    it('요청 ID가 없으면 승인 요청을 전송하지 않는다', async () => {
      const mockDetail = {
        ...createMockRoutineDetail(0),
        id: 0,
      };
      mockAxios.resetHandlers();
      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });
      mockAxios.onPost('/routine/check').reply(200, { data: null });

      const { findByText, getByText } = render(<RequestDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('승인'));
        pressAlertButton('승인');
      });

      expect(mockAxios.history.post).toHaveLength(0);
    });

    it('승인 확인 전에는 요청을 전송하지 않고 확인 후 승인한다', async () => {
      mockAxios.onPost('/routine/check').reply(200, { data: null });
      const { findByText, getByText } = render(<RequestDetailModal />);

      await findByText('테스트 루틴 1');
      fireEvent.press(getByText('승인'));

      expect(mockAlert).toHaveBeenCalledWith(
        '루틴 요청 승인',
        '이 루틴 인증 요청을 승인하시겠습니까?',
        expect.any(Array),
      );
      expect(mockAxios.history.post).toHaveLength(0);

      const confirmButton = mockAlert.mock.calls[0][2]?.find(
        (button: AlertButton) => button.text === '승인',
      );

      await act(async () => {
        confirmButton?.onPress?.();
      });

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
      });
    });

    it('거절 확인 전에는 요청을 전송하지 않고 확인 후 거절한다', async () => {
      mockAxios.onPost('/routine/check').reply(200, { data: null });
      const { findByText, getByText } = render(<RequestDetailModal />);

      await findByText('테스트 루틴 1');
      fireEvent.press(getByText('거절'));

      expect(mockAlert).toHaveBeenCalledWith(
        '루틴 요청 거절',
        '이 루틴 인증 요청을 거절하시겠습니까?',
        expect.any(Array),
      );
      expect(mockAxios.history.post).toHaveLength(0);

      const confirmButton = mockAlert.mock.calls[0][2]?.find(
        (button: AlertButton) => button.text === '거절',
      );

      await act(async () => {
        confirmButton?.onPress?.();
      });

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
      });
    });

    it('확인창에서 취소하면 요청을 전송하지 않는다', async () => {
      mockAxios.onPost('/routine/check').reply(200, { data: null });
      const { findByText, getByText } = render(<RequestDetailModal />);

      await findByText('테스트 루틴 1');
      fireEvent.press(getByText('승인'));

      const cancelButton = mockAlert.mock.calls[0][2]?.find(
        (button: AlertButton) => button.text === '취소',
      );

      await act(async () => {
        cancelButton?.onPress?.();
      });

      expect(mockAxios.history.post).toHaveLength(0);
    });

    it('응답 요청 중에는 승인과 거절 버튼을 비활성화한다', async () => {
      let resolveRequest: () => void = () => {};
      mockAxios.onPost('/routine/check').reply(
        () =>
          new Promise((resolve) => {
            resolveRequest = () => resolve([200, { data: null }]);
          }),
      );
      const screen = render(<RequestDetailModal />);

      await screen.findByText('테스트 루틴 1');
      fireEvent.press(screen.getByText('승인'));

      await act(async () => {
        pressAlertButton('승인');
      });

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
        expect(screen.getByText('승인')).toBeDisabled();
        expect(screen.getByText('거절')).toBeDisabled();
      });

      await act(async () => {
        resolveRequest();
      });

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('재렌더링 전에 승인 확인을 연속 실행해도 요청을 한 번만 보낸다', async () => {
      const resolveRequests: Array<() => void> = [];
      mockAxios.onPost('/routine/check').reply(
        () =>
          new Promise((resolve) => {
            resolveRequests.push(() => resolve([200, { data: null }]));
          }),
      );
      const screen = render(<RequestDetailModal />);

      await screen.findByText('테스트 루틴 1');
      fireEvent.press(screen.getByText('승인'));

      const confirmButton = mockAlert.mock.calls[0][2]?.find(
        (button: AlertButton) => button.text === '승인',
      );

      act(() => {
        confirmButton?.onPress?.();
        confirmButton?.onPress?.();
      });

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
      });

      await act(async () => {
        for (const resolveRequest of resolveRequests) {
          resolveRequest();
        }
      });

      await waitFor(() => {
        expect(mockBack).toHaveBeenCalled();
      });
    });
  });

  describe('승인 시 API 통합 테스트', () => {
    describe('승인 성공 시', () => {
      beforeEach(() => {
        const mockDetail = createMockRoutineDetail(0);

        mockAxios
          .onGet(/\/routine\/confirm\/detail/)
          .reply(200, { data: mockDetail });
        mockAxios.onPost('/routine/check').reply(200, { data: null });
      });

      it('승인 완료 Toast가 표시되고 이전 페이지로 이동한다', async () => {
        const { findByText, getByText } = render(<RequestDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('승인'));
          pressAlertButton('승인');
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '승인되었습니다.',
            'success',
          );
          expect(mockBack).toHaveBeenCalled();
        });
      });

      it('승인 시 입력한 응원의 한마디를 전송한다', async () => {
        const { findByText, getByPlaceholderText, getByText } = render(
          <RequestDetailModal />,
        );

        await findByText('테스트 루틴 1');

        fireEvent.changeText(
          getByPlaceholderText('응원의 한마디를 입력해주세요.'),
          '잘했어요!',
        );

        await act(async () => {
          fireEvent.press(getByText('승인'));
          pressAlertButton('승인');
        });

        await waitFor(() => {
          expect(mockAxios.history.post).toHaveLength(1);
          expect(mockShowToast).toHaveBeenCalledWith(
            '승인되었습니다.',
            'success',
          );
        });

        expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
          confirmId: 1,
          checkStatus: 'PASS',
          checkComment: '잘했어요!',
        });
      });

      it('승인 후 받은 인증 요청 목록 개수로 앱 아이콘 배지를 다시 설정한다', async () => {
        mockAxios.onGet('/routine/confirm/list').reply(200, {
          data: [{ id: 1 }, { id: 2 }],
        });
        mockAxios
          .onGet('/routine/change-requests/received')
          .reply(200, { data: [] });

        const { findByText, getByText } = render(<RequestDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('승인'));
          pressAlertButton('승인');
        });

        await waitFor(() => {
          expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(2);
        });
      });
    });

    describe('승인 실패 시', () => {
      beforeEach(() => {
        const mockDetail = createMockRoutineDetail(0);

        mockAxios
          .onGet(/\/routine\/confirm\/detail/)
          .reply(200, { data: mockDetail });
        mockAxios.onPost('/routine/check').reply(500, {
          error: { message: '서버 오류' },
        });
      });

      it('에러 Toast가 표시된다', async () => {
        const { findByText, getByText } = render(<RequestDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('승인'));
          pressAlertButton('승인');
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '오류가 발생했습니다. 다시 시도해주세요.',
            'error',
          );
        });
      });
    });
  });

  describe('거절 시 API 통합 테스트', () => {
    describe('거절 성공 시', () => {
      beforeEach(() => {
        const mockDetail = createMockRoutineDetail(0);

        mockAxios
          .onGet(/\/routine\/confirm\/detail/)
          .reply(200, { data: mockDetail });
        mockAxios.onPost('/routine/check').reply(200, { data: null });
      });

      it('거절 완료 Toast가 표시되고 이전 페이지로 이동한다', async () => {
        const { findByText, getByText } = render(<RequestDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('거절'));
          pressAlertButton('거절');
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '거절되었습니다.',
            'success',
          );
          expect(mockBack).toHaveBeenCalled();
        });
      });

      it('거절 시 입력한 응원의 한마디를 전송한다', async () => {
        const { findByText, getByPlaceholderText, getByText } = render(
          <RequestDetailModal />,
        );

        await findByText('테스트 루틴 1');

        fireEvent.changeText(
          getByPlaceholderText('응원의 한마디를 입력해주세요.'),
          '다음에 다시 도전해봐요!',
        );

        await act(async () => {
          fireEvent.press(getByText('거절'));
          pressAlertButton('거절');
        });

        await waitFor(() => {
          expect(mockAxios.history.post).toHaveLength(1);
          expect(mockShowToast).toHaveBeenCalledWith(
            '거절되었습니다.',
            'success',
          );
        });

        expect(JSON.parse(mockAxios.history.post[0]?.data ?? '{}')).toEqual({
          confirmId: 1,
          checkStatus: 'DENY',
          checkComment: '다음에 다시 도전해봐요!',
        });
      });

      it('거절 후 받은 인증 요청 목록 개수로 앱 아이콘 배지를 다시 설정한다', async () => {
        mockAxios.onGet('/routine/confirm/list').reply(200, {
          data: [{ id: 1 }],
        });
        mockAxios
          .onGet('/routine/change-requests/received')
          .reply(200, { data: [] });

        const { findByText, getByText } = render(<RequestDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('거절'));
          pressAlertButton('거절');
        });

        await waitFor(() => {
          expect(Notifications.setBadgeCountAsync).toHaveBeenCalledWith(1);
        });
      });
    });

    describe('거절 실패 시', () => {
      beforeEach(() => {
        const mockDetail = createMockRoutineDetail(0);

        mockAxios
          .onGet(/\/routine\/confirm\/detail/)
          .reply(200, { data: mockDetail });
        mockAxios.onPost('/routine/check').reply(500, {
          error: { message: '서버 오류' },
        });
      });

      it('에러 Toast가 표시된다', async () => {
        const { findByText, getByText } = render(<RequestDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('거절'));
          pressAlertButton('거절');
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '오류가 발생했습니다. 다시 시도해주세요.',
            'error',
          );
        });
      });
    });
  });
});
