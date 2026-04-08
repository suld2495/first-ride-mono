import axiosInstance from '@repo/shared/api';
import { getNextMonday } from '@repo/shared/utils';
import type { Reward } from '@repo/types';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import QuestFormModal from '../../../components/modal/quest-form-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;

let mockAxios: MockAdapter;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getNextTuesday = (date: Date) => {
  const nextTuesday = new Date(date);

  nextTuesday.setDate(nextTuesday.getDate() + 1);
  return nextTuesday;
};

const mockRewards: Reward[] = [
  {
    rewardId: 1,
    rewardName: '테스트 EXP 보상',
    rewardType: 'EXP',
    expAmount: 100,
    description: '테스트용 보상',
    createdAt: '2026-01-01T00:00:00',
  },
];

describe('QuestFormModal', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet('/quest/reward/list').reply(200, { data: mockRewards });
    mockBack.mockClear();
    mockShowToast.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const renderModal = () => render(<QuestFormModal />);
  const nextMonday = getNextMonday(new Date());
  const mondayLabel = `${formatDateKey(nextMonday)} 선택 가능`;
  const nextTuesday = getNextTuesday(nextMonday);
  const tuesdayLabel = `${formatDateKey(nextTuesday)} 선택 불가`;

  const fillRequiredFields = async (
    getByPlaceholderText: (text: string) => any,
    getByText: (text: string) => any,
    getByLabelText: (text: string) => any,
    getAllByText: (text: string) => any[],
  ) => {
    await waitFor(() => {
      expect(mockAxios.history.get.length).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('퀘스트 이름을 입력하세요'),
        '주간 출석 퀘스트',
      );
      fireEvent.changeText(
        getByPlaceholderText('퀘스트 설명을 입력하세요'),
        '일주일 동안 앱에 방문하는 퀘스트',
      );
      fireEvent.changeText(
        getByPlaceholderText('필요 레벨 입력 (1-10000)'),
        '10',
      );
      fireEvent.changeText(
        getByPlaceholderText('최대 참여자 수 입력 (1-10000)'),
        '50',
      );
      fireEvent.changeText(getByPlaceholderText('목표 횟수 입력 (예: 7)'), '7');
    });

    await act(async () => {
      fireEvent.press(getByText('보상 선택'));
    });
    await act(async () => {
      fireEvent.press(getByText('테스트 EXP 보상'));
    });

    await act(async () => {
      fireEvent.press(getByText('인증 유형 선택'));
    });
    await act(async () => {
      fireEvent.press(getByText('주간 앱 방문'));
    });

    await act(async () => {
      fireEvent.press(getAllByText('선택')[0]);
    });
    await act(async () => {
      fireEvent.press(getByLabelText(mondayLabel));
    });
    await act(async () => {
      fireEvent.press(getByText('확인'));
    });
  };

  describe('퀘스트 타입 표시', () => {
    it('퀘스트 타입 항목이 표시되지 않는다', async () => {
      const { queryByText } = renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await waitFor(() => {
        expect(queryByText('퀘스트 타입')).not.toBeOnTheScreen();
      });
    });

    it('종료 날짜 항목이 표시되지 않는다', async () => {
      const { queryByText } = renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await waitFor(() => {
        expect(queryByText('종료 날짜')).not.toBeOnTheScreen();
      });
    });
  });

  describe('퀘스트 생성', () => {
    beforeEach(() => {
      mockAxios.onPost('/quest').reply(200, { data: null });
    });

    it('년월 영역을 누르면 월 선택 피커를 열고 적용할 수 있다', async () => {
      const { getAllByText, getByLabelText, getByText, queryByText } =
        renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await act(async () => {
        fireEvent.press(getAllByText('선택')[0]);
      });

      await act(async () => {
        fireEvent.press(getByLabelText('년월 선택 열기'));
      });

      expect(getByText('적용')).toBeOnTheScreen();

      await act(async () => {
        fireEvent.press(getByText('12월'));
      });

      await act(async () => {
        fireEvent.press(getByText('적용'));
      });

      expect(queryByText(/12월/)).toBeOnTheScreen();
    });

    it('커스텀 캘린더에서 월요일만 활성화된다', async () => {
      const { getAllByText, getByLabelText } = renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await act(async () => {
        fireEvent.press(getAllByText('선택')[0]);
      });

      expect(getByLabelText(mondayLabel)).toBeEnabled();
      expect(getByLabelText(tuesdayLabel)).toBeDisabled();
    });

    it('생성 요청 시 questType을 WEEKLY로 전송한다', async () => {
      const { getByPlaceholderText, getByText, getByLabelText, getAllByText } =
        renderModal();

      await fillRequiredFields(
        getByPlaceholderText,
        getByText,
        getByLabelText,
        getAllByText,
      );

      await act(async () => {
        fireEvent.press(getByText('생성하기'));
      });

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
      });

      expect(JSON.parse(mockAxios.history.post[0].data)).toMatchObject({
        questName: '주간 출석 퀘스트',
        questType: 'WEEKLY',
        startDate: `${formatDateKey(nextMonday)}T00:00:00`,
        verificationType: 'WEEKLY_APP_VISIT',
      });
      expect(JSON.parse(mockAxios.history.post[0].data)).not.toHaveProperty(
        'endDate',
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        '퀘스트가 생성되었습니다.',
        'success',
      );
      expect(mockBack).toHaveBeenCalled();
    });

    it('월요일이 아닌 날짜는 아예 선택되지 않는다', async () => {
      const { getAllByText, getByLabelText, getByText, queryByText } =
        renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await act(async () => {
        fireEvent.press(getAllByText('선택')[0]);
      });

      const disabledDate = getByLabelText(tuesdayLabel);
      const confirmButton = getByText('확인');

      expect(disabledDate).toBeDisabled();
      expect(confirmButton).toBeDisabled();

      await act(async () => {
        fireEvent.press(disabledDate);
      });

      expect(queryByText(formatDateKey(nextMonday))).not.toBeOnTheScreen();
      expect(queryByText(formatDateKey(nextTuesday))).not.toBeOnTheScreen();
    });
  });
});
