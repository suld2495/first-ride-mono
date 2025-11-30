import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import RequestDetailModal from '../../../components/modal/RequestDetailModal';
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

describe('RequestDetailModal (루틴 인증 요청 상세 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockRequestStore.requestId = 1;
    mockShowToast.mockClear();
    mockBack.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('루틴 정보 표시 테스트', () => {
    beforeEach(() => {
      const mockDetail = createMockRoutineDetail(0, {
        routineName: '매일 운동하기',
        routineDetail: '30분 이상 운동',
        createdAt: '2025-01-15',
      });

      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });
    });

    it('루틴 이름이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('매일 운동하기')).toBeOnTheScreen();
    });

    it('루틴 상세 설명이 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('30분 이상 운동')).toBeOnTheScreen();
    });

    it('날짜가 화면에 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('2025-01-15')).toBeOnTheScreen();
    });

    it('루틴 이름 라벨이 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('루틴 이름')).toBeOnTheScreen();
    });

    it('응원의 한마디 라벨이 표시된다', async () => {
      const { findByText } = render(<RequestDetailModal />);

      expect(await findByText('응원의 한마디')).toBeOnTheScreen();
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
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '승인되었습니다.',
            'success',
          );
          expect(mockBack).toHaveBeenCalled();
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
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '거절되었습니다.',
            'success',
          );
          expect(mockBack).toHaveBeenCalled();
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

  describe('응원의 한마디 입력 테스트', () => {
    beforeEach(() => {
      const mockDetail = createMockRoutineDetail(0);

      mockAxios
        .onGet(/\/routine\/confirm\/detail/)
        .reply(200, { data: mockDetail });
      mockAxios.onPost('/routine/check').reply(200, { data: null });
    });

    it('응원의 한마디를 입력하고 승인할 수 있다', async () => {
      const { findByText, getByText, getByPlaceholderText } = render(
        <RequestDetailModal />,
      );

      await findByText('테스트 루틴 1');

      const commentInput =
        getByPlaceholderText('응원의 한마디를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(commentInput, '잘했어요!');
      });

      await act(async () => {
        fireEvent.press(getByText('승인'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '승인되었습니다.',
          'success',
        );
      });
    });

    it('응원의 한마디를 입력하고 거절할 수 있다', async () => {
      const { findByText, getByText, getByPlaceholderText } = render(
        <RequestDetailModal />,
      );

      await findByText('테스트 루틴 1');

      const commentInput =
        getByPlaceholderText('응원의 한마디를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(commentInput, '다음에 다시 도전해봐요!');
      });

      await act(async () => {
        fireEvent.press(getByText('거절'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '거절되었습니다.',
          'success',
        );
      });
    });
  });
});
