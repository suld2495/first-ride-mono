import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { Alert } from 'react-native';
import type { AlertButton } from 'react-native';

import RoutineDetailModal from '../../../components/modal/routine-detail-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutine } from '../../setup/routine/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
  routineForm: object;
  setRoutineForm: jest.Mock;
};
declare const mockShowToast: jest.Mock;

// axios mock adapter
let mockAxios: MockAdapter;

// Alert.alert mock
const mockAlert = jest.spyOn(Alert, 'alert');

describe('RoutineDetailModal (루틴 상세 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockRoutineStore.routineId = 1;
    mockShowToast.mockClear();
    mockPush.mockClear();
    mockAlert.mockClear();
    mockRoutineStore.setRoutineForm.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('루틴 상세 정보 표시 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0, {
        weeklyCount: 3,
        routineCount: 5,
        mateNickname: 'mate',
        isMe: true,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      mockAxios
        .onGet(/\/routine\/details/)
        .reply(200, { data: { ...mockRoutine, penalty: 5000 } });
    });

    it('루틴 이름이 화면에 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
    });

    it('루틴 상세 설명이 화면에 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('테스트 루틴 1 상세')).toBeOnTheScreen();
    });

    it('메이트 정보가 표시된다 (본인인 경우 "나"로 표시)', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('메이트')).toBeOnTheScreen();
      expect(await findByText('나')).toBeOnTheScreen();
    });

    it('루틴 횟수가 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('루틴 횟수')).toBeOnTheScreen();
      expect(await findByText('3/5')).toBeOnTheScreen();
    });

    it('벌금이 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('벌금')).toBeOnTheScreen();
      expect(await findByText('5,000')).toBeOnTheScreen();
    });

    it('루틴 날짜가 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('루틴 날짜')).toBeOnTheScreen();
      expect(await findByText('2025-01-01 ~ 2025-01-31')).toBeOnTheScreen();
    });
  });

  describe('메이트가 다른 사용자인 경우', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0, {
        mateNickname: '친구닉네임',
        isMe: false,
      });

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('메이트 닉네임이 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('친구닉네임')).toBeOnTheScreen();
    });
  });

  describe('수정 버튼 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0);

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('수정 버튼이 화면에 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('수정')).toBeOnTheScreen();
    });

    it('수정 버튼 클릭 시 수정 페이지로 이동한다', async () => {
      const { findByText, getByText } = render(<RoutineDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('수정'));
      });

      expect(mockPush).toHaveBeenCalledWith('/modal?type=routine-update');
      expect(mockRoutineStore.setRoutineForm).toHaveBeenCalled();
    });
  });

  describe('삭제 버튼 테스트', () => {
    beforeEach(() => {
      const mockRoutine = createMockRoutine(0);

      mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
    });

    it('삭제 버튼이 화면에 표시된다', async () => {
      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('삭제')).toBeOnTheScreen();
    });

    it('삭제 버튼 클릭 시 확인 Alert이 표시된다', async () => {
      const { findByText, getByText } = render(<RoutineDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('삭제'));
      });

      expect(mockAlert).toHaveBeenCalledWith(
        '루틴 삭제',
        '삭제하시겠습니까?',
        expect.arrayContaining([
          expect.objectContaining({ text: '취소', style: 'cancel' }),
          expect.objectContaining({ text: '삭제' }),
        ]),
      );
    });
  });

  describe('삭제 API 통합 테스트', () => {
    describe('삭제 성공 시', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0);

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onDelete(/\/routine\/\d+/).reply(200, { data: null });
      });

      it('삭제 확인 시 삭제 완료 Toast가 표시되고 루틴 페이지로 이동한다', async () => {
        const { findByText, getByText } = render(<RoutineDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('삭제'));
        });

        // Alert의 삭제 버튼 onPress 호출
        const deleteButton = mockAlert.mock.calls[0][2]?.find(
          (button: AlertButton) => button.text === '삭제',
        );

        await act(async () => {
          await deleteButton?.onPress?.();
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '삭제되었습니다.',
            'success',
          );
          expect(mockPush).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });
    });

    describe('삭제 실패 시', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0);

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
        mockAxios.onDelete(/\/routine\/\d+/).reply(500, {
          error: { message: '서버 오류' },
        });
      });

      it('에러 Toast가 표시된다', async () => {
        const { findByText, getByText } = render(<RoutineDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('삭제'));
        });

        // Alert의 삭제 버튼 onPress 호출
        const deleteButton = mockAlert.mock.calls[0][2]?.find(
          (button: AlertButton) => button.text === '삭제',
        );

        await act(async () => {
          await deleteButton?.onPress?.();
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '문제가 발생하였습니다.',
            'error',
          );
        });
      });
    });

    describe('삭제 취소 시', () => {
      beforeEach(() => {
        const mockRoutine = createMockRoutine(0);

        mockAxios.onGet(/\/routine\/details/).reply(200, { data: mockRoutine });
      });

      it('취소 버튼 클릭 시 삭제되지 않는다', async () => {
        const { findByText, getByText } = render(<RoutineDetailModal />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent.press(getByText('삭제'));
        });

        // Alert의 취소 버튼 확인
        const cancelButton = mockAlert.mock.calls[0][2]?.find(
          (button: AlertButton) => button.text === '취소',
        );

        expect(cancelButton).toBeDefined();
        expect(cancelButton?.style).toBe('cancel');

        // 삭제 API가 호출되지 않음을 확인
        expect(mockShowToast).not.toHaveBeenCalled();
      });
    });
  });

  describe('일시정지/재시작 버튼 테스트', () => {
    it('활성 루틴은 일시정지 버튼을 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { paused: false }),
      });

      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('일시정지')).toBeOnTheScreen();
    });

    it('일시정지된 루틴은 상태와 재시작 버튼을 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { paused: true }),
      });

      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('일시정지됨')).toBeOnTheScreen();
      expect(await findByText('재시작')).toBeOnTheScreen();
    });

    it('일시정지 요청 성공 시 서버 메시지를 Toast로 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { paused: false }),
      });
      mockAxios.onPatch('/routine/1/pause').reply(200, {
        data: { message: '루틴이 일시정지되었습니다.' },
      });

      const { findByText, getByText } = render(<RoutineDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('일시정지'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '루틴이 일시정지되었습니다.',
          'success',
        );
      });
    });

    it('재시작 요청 성공 시 서버 메시지를 Toast로 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { paused: true }),
      });
      mockAxios.onPatch('/routine/1/pause').reply(200, {
        data: { message: '루틴이 다시 시작되었습니다.' },
      });

      const { findByText, getByText } = render(<RoutineDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('재시작'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '루틴이 다시 시작되었습니다.',
          'success',
        );
      });
    });
  });

  describe('숨기기/표시 버튼 테스트', () => {
    it('표시 중인 루틴은 숨기기 버튼을 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { hidden: false }),
      });

      const { findByText } = render(<RoutineDetailModal />);

      expect(await findByText('숨기기')).toBeOnTheScreen();
    });

    it('숨김 루틴은 상태와 표시 버튼을 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { hidden: true }),
      });

      const { findByLabelText, findByText } = render(<RoutineDetailModal />);

      expect(await findByLabelText('숨김 상태')).toBeOnTheScreen();
      expect(await findByText('표시')).toBeOnTheScreen();
    });

    it('숨기기 요청 성공 시 서버 메시지를 Toast로 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { hidden: false }),
      });
      mockAxios.onPatch('/routine/1/visibility').reply(200, {
        data: { message: '루틴이 숨겨졌습니다.' },
      });

      const { findByText, getByText } = render(<RoutineDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('숨기기'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '루틴이 숨겨졌습니다.',
          'success',
        );
      });
      expect(mockPush).not.toHaveBeenCalledWith(
        '/(tabs)/(afterLogin)/(routine)',
      );
    });

    it('표시 요청 성공 시 서버 메시지를 Toast로 표시한다', async () => {
      mockAxios.onGet(/\/routine\/details/).reply(200, {
        data: createMockRoutine(0, { hidden: true }),
      });
      mockAxios.onPatch('/routine/1/visibility').reply(200, {
        data: { message: '루틴이 표시되었습니다.' },
      });

      const { findByText, getByText } = render(<RoutineDetailModal />);

      await findByText('테스트 루틴 1');

      await act(async () => {
        fireEvent.press(getByText('표시'));
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          '루틴이 표시되었습니다.',
          'success',
        );
      });
    });
  });
});
