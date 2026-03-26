import axiosInstance from '@repo/shared/api';
import { Reward } from '@repo/types';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import QuestFormModal from '../../../components/modal/QuestFormModal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;

let mockDateTimePickerOnChange: ((event: unknown, date?: Date) => void) | null =
  null;
let mockDateTimePickerMode: 'date' | 'time' | 'datetime' | undefined;

jest.mock('@react-native-community/datetimepicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');

  return {
    __esModule: true,
    default: ({
      onChange,
      mode,
    }: {
      onChange: (event: unknown, date?: Date) => void;
      mode?: 'date' | 'time' | 'datetime';
    }) => {
      mockDateTimePickerOnChange = onChange;
      mockDateTimePickerMode = mode;

      return React.createElement('RNDateTimePicker', { testID: 'date-picker' });
    },
  };
});

let mockAxios: MockAdapter;

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
    mockDateTimePickerOnChange = null;
    mockDateTimePickerMode = undefined;
    mockBack.mockClear();
    mockShowToast.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const renderModal = () => render(<QuestFormModal />);

  const fillRequiredFields = async (
    getByPlaceholderText: (text: string) => any,
    getByText: (text: string) => any,
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
      fireEvent.changeText(
        getByPlaceholderText('목표 횟수 입력 (예: 7)'),
        '7',
      );
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
      mockDateTimePickerOnChange?.({}, new Date('2099-01-05T09:00:00'));
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

    it('날짜 선택기는 날짜만 선택할 수 있다', async () => {
      const { getAllByText } = renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await act(async () => {
        fireEvent.press(getAllByText('선택')[0]);
      });

      expect(mockDateTimePickerMode).toBe('date');
    });

    it('생성 요청 시 questType을 WEEKLY로 전송한다', async () => {
      const { getByPlaceholderText, getByText, getAllByText } = renderModal();

      await fillRequiredFields(getByPlaceholderText, getByText, getAllByText);

      await act(async () => {
        fireEvent.press(getByText('생성하기'));
      });

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
      });

      expect(JSON.parse(mockAxios.history.post[0].data)).toMatchObject({
        questName: '주간 출석 퀘스트',
        questType: 'WEEKLY',
        startDate: '2099-01-05T00:00:00',
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

    it('월요일이 아닌 날짜를 고르면 같은 주 월요일로 맞춰진다', async () => {
      const { getAllByText, getByText, findByText, queryByText } = renderModal();

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await act(async () => {
        fireEvent.press(getAllByText('선택')[0]);
      });

      await act(async () => {
        mockDateTimePickerOnChange?.({}, new Date('2099-01-06T09:00:00'));
      });

      await act(async () => {
        fireEvent.press(getByText('확인'));
      });

      expect(await findByText('2099-01-05')).toBeOnTheScreen();
      expect(queryByText('2099-01-06')).not.toBeOnTheScreen();
    });
  });
});
