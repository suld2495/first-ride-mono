import axiosInstance from '@repo/shared/api';
import { getFormatDate, getThisWeekMonday } from '@repo/shared/utils';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { Alert, StyleSheet as RNStyleSheet } from 'react-native';

import ModalScreen from '../../../app/modal';
import ModalHeaderActionContext from '../../../components/modal/modal-header-action-context';
import ModalHeaderActionProvider from '../../../components/modal/modal-header-action-provider';
import RoutineFormModal from '../../../components/modal/routine-form-modal';
import { SHOW_SCROLL_INDICATOR } from '../../../constants/SCROLL_INDICATOR';
import { baseFoundation, palette } from '../../../theme/tokens';
import {
  fireEvent,
  render as renderWithProviders,
  resetAuthMocks,
} from '../../setup/auth-test-utils';
import { createMockFriends } from '../../setup/friend/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockBack: jest.Mock;
declare const mockDismissTo: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
  routineForm: Record<string, unknown>;
  setRoutineForm: jest.Mock;
};
declare const mockShowToast: jest.Mock;

// BouncyCheckbox mock - global 변수 사용
(global as any).mockCheckboxChecked = false;

jest.mock('react-native-bouncy-checkbox', () => {
  const React = require('react');

  const { Text, View } = require('react-native');

  return {
    __esModule: true,
    default: ({
      isChecked,
      onPress,
      text,
    }: {
      isChecked?: boolean;
      onPress: (checked: boolean) => void;
      text?: string;
    }) => {
      return React.createElement(
        View,
        {
          testID: 'bouncy-checkbox',
          isChecked,
          onPress: () => {
            (global as any).mockCheckboxChecked = !(global as any)
              .mockCheckboxChecked;
            onPress((global as any).mockCheckboxChecked);
          },
        },
        text ? React.createElement(Text, null, text) : null,
      );
    },
  };
});

// axios mock adapter
let mockAxios: MockAdapter;
const mockAlert = jest.spyOn(Alert, 'alert');

const ModalHeaderActionOutlet = () => {
  const context = React.useContext(ModalHeaderActionContext);

  return <>{context?.action}</>;
};

const render = (ui: React.ReactElement) =>
  renderWithProviders(
    <ModalHeaderActionProvider>
      {ui}
      <ModalHeaderActionOutlet />
    </ModalHeaderActionProvider>,
  );

const DEFAULT_UPDATE_ROUTINE_DETAIL = {
  routineId: 1,
  nickname: 'testuser',
  routineName: '기존 루틴',
  routineDetail: '기존 설명',
  penalty: 5000,
  weeklyCount: 0,
  routineCount: 3,
  mateNickname: '',
  isMe: true,
  startDate: '2025-01-06',
  endDate: '',
  successDate: [],
  paused: false,
  hidden: false,
};
const APPLIED_UPDATE_RESPONSE = {
  mode: 'APPLIED',
  message: '루틴이 수정되었습니다.',
  changeRequestId: null,
  changeRequest: null,
};
const APPROVAL_REQUESTED_UPDATE_RESPONSE = {
  mode: 'APPROVAL_REQUESTED',
  message: '메이트 승인 요청이 생성되었습니다.',
  changeRequestId: 100,
  changeRequest: {
    id: 100,
  },
};

const mockRoutineDetail = (overrides: Record<string, unknown> = {}) => {
  mockAxios.onGet(/\/routine\/details/).reply(200, {
    data: {
      ...DEFAULT_UPDATE_ROUTINE_DETAIL,
      ...overrides,
    },
  });
};

// useDebounce mock - 즉시 값을 반환하여 debounce 지연 제거
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

jest.mock('@/hooks/useModal', () => ({
  useModal: (type: string) => {
    const RoutineFormModalComponent =
      require('@/components/modal/routine-form-modal').default;

    return [
      type === 'routine-update' ? '루틴 수정' : '루틴 추가',
      RoutineFormModalComponent,
      {},
    ];
  },
}));

jest.mock('@/components/modal/modal-header', () => {
  const React = require('react');
  const { Text, View } = require('react-native');
  const ModalHeaderActionContext =
    require('@/components/modal/modal-header-action-context').default;

  const MockModalHeader = ({ title }: { title: string }) => {
    const context = React.useContext(ModalHeaderActionContext);

    return React.createElement(
      View,
      null,
      React.createElement(Text, null, title),
      context?.action,
    );
  };

  MockModalHeader.displayName = 'MockModalHeader';

  return MockModalHeader;
});

describe('RoutineFormModal (루틴 추가 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockSearchParams.type = 'routine-add';
    // RoutineForm 타입에 맞는 초기값 설정
    // 숫자 필드는 빈 문자열로 설정 (입력 전 상태)
    mockRoutineStore.routineForm = {
      nickname: '',
      routineName: '',
      routineDetail: '',
      penalty: '',
      routineCount: '',
      mateNickname: '',
      isMe: true,
      startDate: '',
      endDate: '',
      symbolColor: '#00D68F',
    };
    mockRoutineStore.routineId = 0;
    (global as any).mockCheckboxChecked = false;
    mockShowToast.mockClear();
    mockAlert.mockClear();

    // 친구 목록 API 기본 목킹 (/friends?nickname=...)
    // axios interceptor가 response.data.data를 반환하므로 { data: [...] } 형식으로 응답해야 함
    mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 폼 입력 헬퍼 함수
  const fillForm = async (
    getByPlaceholderText: (text: string) => any,
    getByText: (text: string) => any,
    data: {
      routineName?: string;
      routineDetail?: string;
      penalty?: string;
      routineCount?: number;
    },
  ) => {
    if (data.routineName) {
      await act(async () => {
        fireEvent.changeText(
          getByPlaceholderText('루틴 이름을 입력하세요.'),
          data.routineName,
        );
      });
    }
    if (data.routineDetail) {
      await act(async () => {
        fireEvent.changeText(
          getByPlaceholderText('루틴 설명을 입력해주세요.'),
          data.routineDetail,
        );
      });
    }
    if (data.penalty) {
      await act(async () => {
        fireEvent.changeText(
          getByPlaceholderText('벌금을 입력해주세요.'),
          data.penalty,
        );
      });
    }
    if (data.routineCount) {
      await act(async () => {
        fireEvent.press(getByText('루틴 횟수를 선택해주세요.'));
      });

      await act(async () => {
        fireEvent.press(getByText(`일주일에 ${data.routineCount}회`));
      });
    }
  };

  const getPreviousDate = (date: Date) => {
    const previousDate = new Date(date);

    previousDate.setDate(previousDate.getDate() - 1);
    return previousDate;
  };

  const getNextDate = (date: Date) => {
    const nextDate = new Date(date);

    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  };

  const getStartOfToday = () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    return today;
  };

  // 날짜 선택 헬퍼 함수
  const selectStartDate = async (
    getByText: (text: string) => any,
    getByLabelText: (text: string) => any,
    date = getStartOfToday(),
  ) => {
    await act(async () => {
      fireEvent.press(getByText('시작일 선택'));
    });

    await act(async () => {
      fireEvent.press(getByLabelText(`${getFormatDate(date)} 선택 가능`));
    });

    await act(async () => {
      fireEvent.press(getByText('확인'));
    });
  };

  const getNextWeekDate = (date: Date) => {
    const nextWeekDate = new Date(date);

    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    return nextWeekDate;
  };

  // 모든 필수 필드 입력 헬퍼 함수
  // isMe가 이미 true로 설정되어 있으므로 체크박스 클릭 불필요
  const fillAllRequiredFields = async (
    getByPlaceholderText: (text: string) => any,
    getByText: (text: string) => any,
    getByLabelText: (text: string) => any,
  ) => {
    // API 호출이 완료될 때까지 대기
    await waitFor(() => {
      expect(mockAxios.history.get.length).toBeGreaterThan(0);
    });

    await fillForm(getByPlaceholderText, getByText, {
      routineName: '테스트 루틴',
      routineDetail: '테스트 설명',
      penalty: '1000',
      routineCount: 3,
    });

    // 시작 날짜 선택
    await selectStartDate(getByText, getByLabelText);
  };

  describe('필수값 입력 전 추가 버튼 비활성화 테스트', () => {
    it('메이트와 루틴 체크를 기본 해제하고 메이트 입력을 비활성화한다', () => {
      const { getByPlaceholderText, getByTestId, getByText } = render(
        <RoutineFormModal />,
      );

      expect(getByText('메이트와 루틴 체크')).toBeOnTheScreen();
      expect(getByTestId('bouncy-checkbox').props.isChecked).toBe(false);
      expect(
        getByPlaceholderText('메이트를 지정해주세요.').props.editable,
      ).toBe(false);
    });

    it('생성 버튼은 modal.tsx의 고정 header action에 표시된다', () => {
      const { getByTestId, getByText, queryByTestId, queryByText } = render(
        <ModalScreen />,
      );

      const buttonContainerStyle = RNStyleSheet.flatten(
        getByTestId('routine-form-button-container').props.style,
      );

      expect(queryByTestId('modal-footer')).not.toBeOnTheScreen();
      expect(queryByText('취소')).not.toBeOnTheScreen();
      expect(getByText('생성')).toBeOnTheScreen();
      expect(buttonContainerStyle).toMatchObject({
        minWidth: 56,
        height: 28,
        borderRadius: 8,
      });
    });

    it('루틴 기간 안내 아이콘을 누르면 툴팁이 표시된다', async () => {
      const { getByLabelText, getByText, queryByText } = render(
        <RoutineFormModal />,
      );

      expect(
        queryByText('시작일부터 종료일까지 루틴을 진행할 기간을 선택해주세요.'),
      ).not.toBeOnTheScreen();

      await act(async () => {
        fireEvent.press(getByLabelText('루틴 기간 안내 보기'));
      });

      expect(
        getByText('시작일부터 종료일까지 루틴을 진행할 기간을 선택해주세요.'),
      ).toBeOnTheScreen();
    });

    it('루틴 기간 안내 아이콘은 SVG 아이콘을 사용한다', () => {
      const { getByTestId } = render(<RoutineFormModal />);

      expect(getByTestId('routine-period-warning-icon')).toBeOnTheScreen();
    });

    it('루틴 기간 툴팁이 열린 상태에서 다른 곳을 누르면 툴팁이 닫힌다', async () => {
      const { getByLabelText, getByText, queryByText } = render(
        <RoutineFormModal />,
      );

      await act(async () => {
        fireEvent.press(getByLabelText('루틴 기간 안내 보기'));
      });

      expect(
        getByText('시작일부터 종료일까지 루틴을 진행할 기간을 선택해주세요.'),
      ).toBeOnTheScreen();

      await act(async () => {
        fireEvent.press(getByLabelText('루틴 기간 안내 닫기'));
      });

      expect(
        queryByText('시작일부터 종료일까지 루틴을 진행할 기간을 선택해주세요.'),
      ).not.toBeOnTheScreen();
    });

    it('시작일 선택 시 캘린더가 바텀 시트로 열린다', async () => {
      const { getByLabelText, getByTestId, getByText } = render(
        <RoutineFormModal />,
      );

      await act(async () => {
        fireEvent.press(getByText('시작일 선택'));
      });

      expect(getByLabelText('시작일 선택 바텀 시트')).toBeOnTheScreen();
      expect(
        getByTestId('date-picker-backdrop').props.entering.constructor
          .presetName,
      ).toBe('FadeIn');
      expect(
        getByTestId('date-picker-backdrop').props.exiting.constructor
          .presetName,
      ).toBe('FadeOut');
      expect(
        getByTestId('date-picker-sheet').props.entering.constructor.presetName,
      ).toBe('SlideInDown');
      expect(
        getByTestId('date-picker-sheet').props.exiting.constructor.presetName,
      ).toBe('SlideOutDown');
      expect(
        getByLabelText(`${getFormatDate(getStartOfToday())} 선택 가능`),
      ).toBeOnTheScreen();
    });

    it('시작일은 오늘부터 월요일이 아닌 미래 날짜도 선택할 수 있다', async () => {
      const { getByLabelText, getByText } = render(<RoutineFormModal />);
      const today = getStartOfToday();
      const yesterday = getPreviousDate(today);
      const tomorrow = getNextDate(today);

      await act(async () => {
        fireEvent.press(getByText('시작일 선택'));
      });

      expect(
        getByLabelText(`${getFormatDate(yesterday)} 선택 불가`),
      ).toBeDisabled();
      expect(getByLabelText(`${getFormatDate(today)} 선택 가능`)).toBeEnabled();
      expect(
        getByLabelText(`${getFormatDate(tomorrow)} 선택 가능`),
      ).toBeEnabled();
    });

    it('종료일 선택 시 캘린더가 바텀 시트로 열린다', async () => {
      const { getByLabelText, getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('종료일 선택'));
      });

      expect(getByLabelText('종료일 선택 바텀 시트')).toBeOnTheScreen();
      expect(
        getByLabelText(`${getFormatDate(getStartOfToday())} 선택 가능`),
      ).toBeOnTheScreen();
    });

    it('종료일은 시작일 포함 이후 날짜를 선택할 수 있다', async () => {
      const { getByLabelText, getByText } = render(<RoutineFormModal />);
      const startDate = getNextWeekDate(getThisWeekMonday());
      const previousDate = getPreviousDate(startDate);
      const nextDate = getNextDate(startDate);

      await selectStartDate(getByText, getByLabelText, startDate);

      await act(async () => {
        fireEvent.press(getByText('종료일 선택'));
      });

      expect(
        getByLabelText(`${getFormatDate(previousDate)} 선택 불가`),
      ).toBeDisabled();
      expect(
        getByLabelText(`${getFormatDate(startDate)} 선택 가능`),
      ).toBeEnabled();
      expect(
        getByLabelText(`${getFormatDate(nextDate)} 선택 가능`),
      ).toBeEnabled();
    });

    it('모든 필드가 비어있을 때 추가 버튼이 비활성화되어 있다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const addButton = getByText('생성');

      expect(addButton).toBeDisabled();
    });

    it('모든 필수값 입력 시 혼자 루틴 추가 버튼이 활성화된다', async () => {
      const { getByLabelText, getByPlaceholderText, getByText } = render(
        <RoutineFormModal />,
      );

      await fillAllRequiredFields(
        getByPlaceholderText,
        getByText,
        getByLabelText,
      );

      await waitFor(
        () => {
          const addButton = getByText('생성');

          expect(addButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('벌금 없이 필수값을 입력하면 추가 버튼이 활성화된다', async () => {
      const { getByLabelText, getByPlaceholderText, getByText } = render(
        <RoutineFormModal />,
      );

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await fillForm(getByPlaceholderText, getByText, {
        routineName: '테스트 루틴',
        routineDetail: '테스트 설명',
        routineCount: 3,
      });

      await selectStartDate(getByText, getByLabelText);

      await waitFor(
        () => {
          const addButton = getByText('생성');

          expect(addButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('루틴 설명 없이 필수값을 입력하면 추가 버튼이 활성화된다', async () => {
      const { getByLabelText, getByPlaceholderText, getByText } = render(
        <RoutineFormModal />,
      );

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await fillForm(getByPlaceholderText, getByText, {
        routineName: '테스트 루틴',
        routineCount: 3,
      });

      await selectStartDate(getByText, getByLabelText);

      await waitFor(
        () => {
          const addButton = getByText('생성');

          expect(addButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('사용자 인풋 유효성 검사 테스트', () => {
    it('10개 컬러 중 하나를 선택한다', async () => {
      const { getAllByTestId, getByLabelText, getByTestId } = render(
        <RoutineFormModal />,
      );

      expect(getAllByTestId(/^routine-color-option-/)).toHaveLength(10);
      expect(getAllByTestId(/^routine-color-row-/)).toHaveLength(2);
      expect(
        RNStyleSheet.flatten(getByTestId('routine-color-row-0').props.style),
      ).toMatchObject({
        flexDirection: 'row',
        justifyContent: 'space-between',
      });
      expect(
        RNStyleSheet.flatten(
          getByTestId('routine-color-option-00D68F').props.style,
        ),
      ).toMatchObject({
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 3,
        borderColor: '#FFFFFF',
      });
      expect(
        getByLabelText('컬러 초록 선택됨').props.accessibilityState,
      ).toEqual({ selected: true });

      await act(async () => {
        fireEvent.press(getByLabelText('컬러 파랑 선택'));
      });

      expect(
        getByLabelText('컬러 파랑 선택됨').props.accessibilityState,
      ).toEqual({ selected: true });
    });

    it('루틴 횟수는 1회부터 7회까지 Select 옵션으로 선택한다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('루틴 횟수를 선택해주세요.'));
      });

      for (let count = 1; count <= 7; count += 1) {
        expect(getByText(`일주일에 ${count}회`)).toBeOnTheScreen();
      }

      await act(async () => {
        fireEvent.press(getByText('일주일에 5회'));
      });

      expect(getByText('일주일에 5회')).toBeOnTheScreen();
    });

    it('벌금 입력 시 숫자만 입력된다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const penaltyInput = getByPlaceholderText('벌금을 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(penaltyInput, 'abc1000');
      });

      // 숫자만 남음 (1000), 포맷팅 적용 (1,000)
      expect(penaltyInput.props.value).toBe('1,000');
    });

    it('벌금 입력 시 천 단위 콤마가 표시된다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const penaltyInput = getByPlaceholderText('벌금을 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(penaltyInput, '10000');
      });

      expect(penaltyInput.props.value).toBe('10,000');
    });
  });

  describe('API 통합 테스트', () => {
    describe('루틴 생성 성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/routine/me').reply(201, {
          data: { message: '내 루틴이 성공적으로 등록되었습니다.' },
        });
      });

      it('성공 알림이 표시되고 루틴 페이지로 이동한다', async () => {
        const { getByLabelText, getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(
          getByPlaceholderText,
          getByText,
          getByLabelText,
        );

        await waitFor(() => {
          const addButton = getByText('생성');

          expect(addButton).toBeEnabled();
        });

        const addButton = getByText('생성');

        await act(async () => {
          fireEvent.press(addButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith('루틴이 생성되었습니다.');
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });

      it('메이트 체크가 해제된 기본 상태에서 내 루틴 API에 허용된 필드만 보낸다', async () => {
        const { getByLabelText, getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await waitFor(() => {
          expect(mockAxios.history.get.length).toBeGreaterThan(0);
        });

        await fillForm(getByPlaceholderText, getByText, {
          routineName: '테스트 루틴',
          routineDetail: '테스트 설명',
          routineCount: 3,
        });

        await selectStartDate(getByText, getByLabelText);

        await waitFor(() => {
          expect(getByText('생성')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('생성'));
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.post[0]?.data ?? '{}');

          expect(mockAxios.history.post[0]?.url).toBe('/routine/me');
          expect(payload).toMatchObject({
            routineName: '테스트 루틴',
            routineDetail: '테스트 설명',
            routineCount: 3,
            symbolColor: '#00D68F',
          });
          expect(payload).not.toHaveProperty('nickname');
          expect(payload).not.toHaveProperty('isMe');
          expect(payload).not.toHaveProperty('penalty');
          expect(payload).not.toHaveProperty('mateNickname');
          expect(payload).not.toHaveProperty('endDate');
        });
      });

      it('메이트와 루틴 체크 시 메이트 루틴 API에 벌금과 메이트를 보낸다', async () => {
        mockAxios.onPost('/routine/mate').reply(201, {
          data: { message: '메이트 루틴이 성공적으로 등록되었습니다.' },
        });
        const { getByLabelText, getByPlaceholderText, getByTestId, getByText } =
          render(<RoutineFormModal />);

        await act(async () => {
          fireEvent.press(getByTestId('bouncy-checkbox'));
        });

        const mateInput = getByPlaceholderText('메이트를 지정해주세요.');

        await waitFor(() => {
          expect(mateInput.props.editable).toBe(true);
        });

        await act(async () => {
          fireEvent.changeText(mateInput, 'friend1');
        });

        await fillForm(getByPlaceholderText, getByText, {
          routineName: '메이트 루틴',
          routineDetail: '함께 달리기',
          penalty: '5000',
          routineCount: 3,
        });
        await selectStartDate(getByText, getByLabelText);

        await waitFor(() => {
          expect(getByText('생성')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('생성'));
        });

        await waitFor(() => {
          const request = mockAxios.history.post.find(
            ({ url }) => url === '/routine/mate',
          );
          const payload = JSON.parse(request?.data ?? '{}');

          expect(payload).toMatchObject({
            routineName: '메이트 루틴',
            routineDetail: '함께 달리기',
            routineCount: 3,
            symbolColor: '#00D68F',
            penalty: 5000,
            mateNickname: 'friend1',
          });
          expect(payload).not.toHaveProperty('nickname');
          expect(payload).not.toHaveProperty('isMe');
          expect(payload).not.toHaveProperty('endDate');
        });
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/routine/me').reply(500, {
          error: {
            message: '서버 오류가 발생했습니다.',
          },
        });
      });

      it('실패 알림이 표시된다', async () => {
        const { getByLabelText, getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(
          getByPlaceholderText,
          getByText,
          getByLabelText,
        );

        await waitFor(
          () => {
            const addButton = getByText('생성');

            expect(addButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const addButton = getByText('생성');

        await act(async () => {
          fireEvent.press(addButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '서버 오류가 발생했습니다.',
            'error',
          );
        });
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/routine/me').networkError();
      });

      it('실패 알림이 표시된다', async () => {
        const { getByLabelText, getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(
          getByPlaceholderText,
          getByText,
          getByLabelText,
        );

        await waitFor(
          () => {
            const addButton = getByText('생성');

            expect(addButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const addButton = getByText('생성');

        await act(async () => {
          fireEvent.press(addButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '네트워크 연결을 확인해 주세요.',
            'error',
          );
        });
      });
    });
  });

  describe('취소 버튼 테스트', () => {
    it('취소 버튼이 화면에 표시되지 않는다', async () => {
      const { queryByText } = render(<RoutineFormModal />);

      expect(queryByText('취소')).not.toBeOnTheScreen();
    });

    it('루틴 상태 체크박스 항목은 표시되지 않는다', async () => {
      const { queryByText } = render(<RoutineFormModal />);

      expect(queryByText('루틴 일시정지')).not.toBeOnTheScreen();
      expect(queryByText('루틴 숨김')).not.toBeOnTheScreen();
    });
  });
});

describe('RoutineFormModal (루틴 수정 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockSearchParams.type = 'routine-edit';
    mockBack.mockClear();
    // 수정 모드에서는 기존 루틴 데이터가 있는 상태로 시작
    mockRoutineStore.routineForm = {
      nickname: 'testuser',
      routineName: '기존 루틴',
      routineDetail: '기존 설명',
      penalty: '5000',
      routineCount: '3',
      mateNickname: '',
      isMe: true,
      startDate: '2025-01-06',
      endDate: '',
    };
    mockRoutineStore.routineId = 1;
    (global as any).mockCheckboxChecked = true; // isMe가 true이므로
    mockShowToast.mockClear();
    mockAlert.mockClear();

    // 친구 목록 API 기본 목킹
    mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
    mockRoutineDetail();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('초기 렌더링 테스트', () => {
    it('기존 루틴 데이터가 폼에 표시된다', async () => {
      const { findByPlaceholderText, findByText } = render(
        <RoutineFormModal />,
      );

      // 기존 루틴 이름이 표시되어야 함
      const routineNameInput = await findByPlaceholderText(
        '루틴 이름을 입력하세요.',
      );

      expect(routineNameInput.props.value).toBe('기존 루틴');

      // 기존 루틴 설명이 표시되어야 함
      const routineDetailInput = await findByPlaceholderText(
        '루틴 설명을 입력해주세요.',
      );

      expect(routineDetailInput.props.value).toBe('기존 설명');

      // 기존 벌금이 표시되어야 함 (천 단위 콤마 적용)
      const penaltyInput = await findByPlaceholderText(
        '벌금을 입력해주세요.',
      );

      expect(penaltyInput.props.value).toBe('5,000');

      // 기존 루틴 횟수가 표시되어야 함
      expect(await findByText('일주일에 3회')).toBeOnTheScreen();

      // 시작 날짜가 표시되어야 함
      expect(await findByText('2025-01-06')).toBeOnTheScreen();
    });

    it('수정 모달은 routineId로 상세 조회한 값을 폼에 표시한다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineStore.routineId = 77;
      mockRoutineStore.routineForm = {
        ...mockRoutineStore.routineForm,
        routineName: '리스트 루틴',
        routineDetail: '리스트 설명',
        mateNickname: 'testuser',
        isMe: undefined,
      };
      mockRoutineDetail({
        routineId: 77,
        routineName: '상세 루틴',
        routineDetail: '상세 설명',
        penalty: 3000,
        routineCount: 5,
        startDate: '2026-05-26',
      });

      const { getAllByTestId, getByPlaceholderText, getByText } = render(
        <RoutineFormModal />,
      );

      await waitFor(() => {
        expect(
          mockAxios.history.get.some((request) =>
            request.url?.startsWith('/routine/details?routineId=77'),
          ),
        ).toBe(true);
      });

      expect(getByPlaceholderText('루틴 이름을 입력하세요.').props.value).toBe(
        '상세 루틴',
      );
      expect(
        getByPlaceholderText('루틴 설명을 입력해주세요.').props.value,
      ).toBe('상세 설명');
      expect(getByText('일주일에 5회')).toBeOnTheScreen();
      expect(getByText('2026-05-26')).toBeOnTheScreen();
      expect(getAllByTestId('bouncy-checkbox')[0].props.isChecked).toBe(false);
    });

    it('수정 버튼이 화면에 표시된다', async () => {
      const { findByText } = render(<RoutineFormModal />);

      const editButton = await findByText('저장');

      expect(editButton).toBeOnTheScreen();
    });

    it('수정 버튼 배경은 gray 90 색상으로 고정된다', async () => {
      const { findByText } = render(<RoutineFormModal />);

      const editButtonText = await findByText('저장');
      let editButton = editButtonText.parent;

      while (
        editButton &&
        !('backgroundColor' in RNStyleSheet.flatten(editButton.props.style))
      ) {
        editButton = editButton.parent;
      }

      const editButtonStyle = RNStyleSheet.flatten(editButton?.props.style);

      expect(editButtonStyle).toEqual(
        expect.objectContaining({
          backgroundColor: palette.theme.gray[90],
          borderRadius: 8,
        }),
      );
    });

    it('취소 버튼은 폼 내부에 표시되지 않는다', async () => {
      const { queryByText } = render(<RoutineFormModal />);

      expect(queryByText('취소')).not.toBeOnTheScreen();
    });

    it('메이트가 지정된 루틴은 메이트 이름만 표시한다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        isMe: false,
        mateNickname: '메이트닉네임',
      });

      const { findByText, queryByPlaceholderText, queryByText } = render(
        <RoutineFormModal />,
      );

      expect(await findByText('메이트')).toBeOnTheScreen();
      expect(await findByText('메이트닉네임')).toBeOnTheScreen();
      expect(queryByText('메이트와 루틴 체크')).not.toBeOnTheScreen();
      expect(
        queryByPlaceholderText('메이트를 지정해주세요.'),
      ).not.toBeOnTheScreen();
    });

    it('메이트가 지정되지 않은 루틴은 메이트 항목을 표시하지 않는다', async () => {
      const { findByPlaceholderText, queryByPlaceholderText, queryByText } =
        render(<RoutineFormModal />);

      expect(
        await findByPlaceholderText('루틴 이름을 입력하세요.'),
      ).toBeOnTheScreen();
      expect(queryByText('메이트')).not.toBeOnTheScreen();
      expect(queryByText('메이트와 루틴 체크')).not.toBeOnTheScreen();
      expect(
        queryByPlaceholderText('메이트를 지정해주세요.'),
      ).not.toBeOnTheScreen();
    });

    it('승인 대기 수정 요청이 있으면 수정 요청 버튼을 복원한다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        isMe: false,
        mateNickname: '메이트닉네임',
        hasPendingChangeRequest: true,
        pendingChangeRequestId: 100,
        pendingChangeRequestStatus: null,
      });

      const { findByText } = render(<RoutineFormModal />);

      expect(await findByText('수정 요청 보냄')).toBeOnTheScreen();
      expect(mockAxios.history.put).toHaveLength(0);
    });
  });

  describe('필수값 유효성 검사 테스트', () => {
    it('루틴 이름을 비우면 수정 버튼이 비활성화된다', async () => {
      const { findByPlaceholderText, getByText } = render(
        <RoutineFormModal />,
      );

      const routineNameInput = await findByPlaceholderText(
        '루틴 이름을 입력하세요.',
      );

      await act(async () => {
        fireEvent.changeText(routineNameInput, '');
      });

      await waitFor(() => {
        const editButton = getByText('저장');

        expect(editButton).toBeDisabled();
      });
    });

    it('루틴 횟수를 비우면 수정 버튼이 비활성화된다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({ routineCount: '' });

      const { findByText, getByText } = render(<RoutineFormModal />);

      expect(
        await findByText('루틴 횟수를 선택해주세요.'),
      ).toBeOnTheScreen();

      await waitFor(() => {
        const editButton = getByText('저장');

        expect(editButton).toBeDisabled();
      });
    });

    it('모든 필수값이 유효하고 값 변경 시 수정 버튼이 활성화된다', async () => {
      const { findByPlaceholderText, getByText } = render(
        <RoutineFormModal />,
      );

      // 입력값이 올바르게 설정되었는지 확인
      const routineNameInput = await findByPlaceholderText(
        '루틴 이름을 입력하세요.',
      );

      expect(routineNameInput.props.value).toBe('기존 루틴');

      // 값을 변경하여 유효성 검사 트리거
      await act(async () => {
        fireEvent.changeText(routineNameInput, '수정된 루틴');
      });

      // 폼이 렌더링되고 유효성 검사가 완료될 때까지 대기
      await waitFor(
        () => {
          const editButton = getByText('저장');

          expect(editButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('루틴 설명을 비워도 수정 버튼이 활성화된다', async () => {
      const { findByPlaceholderText, getByText } = render(<RoutineFormModal />);

      const routineDetailInput =
        await findByPlaceholderText('루틴 설명을 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineDetailInput, '');
      });

      await waitFor(
        () => {
          const editButton = getByText('저장');

          expect(editButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('기존 저장 메이트 값이면 친구 검색 결과에 없어도 수정 버튼이 처음부터 활성화된다', async () => {
      mockRoutineStore.routineForm = {
        ...mockRoutineStore.routineForm,
        isMe: false,
        mateNickname: 'Fffft',
      };

      const { getByText } = render(<RoutineFormModal />);

      await waitFor(
        () => {
          expect(getByText('저장')).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('기존 메이트 값이 내 닉네임이면 메이트 항목을 표시하지 않는다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        isMe: true,
        mateNickname: 'testuser',
      });

      const { findByPlaceholderText, queryByPlaceholderText, queryByText } =
        render(<RoutineFormModal />);

      await findByPlaceholderText('루틴 이름을 입력하세요.');
      expect(queryByText('메이트')).not.toBeOnTheScreen();
      expect(
        queryByPlaceholderText('메이트를 지정해주세요.'),
      ).not.toBeOnTheScreen();
    });

    it('isMe가 false여도 메이트 값이 내 닉네임이면 메이트 항목을 표시하지 않는다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        isMe: false,
        mateNickname: 'testuser',
      });

      const { findByPlaceholderText, queryByPlaceholderText, queryByText } =
        render(<RoutineFormModal />);

      await findByPlaceholderText('루틴 이름을 입력하세요.');
      expect(queryByText('메이트')).not.toBeOnTheScreen();
      expect(
        queryByPlaceholderText('메이트를 지정해주세요.'),
      ).not.toBeOnTheScreen();
    });
  });

  describe('사용자 인풋 유효성 검사 테스트', () => {
    it('루틴 횟수는 Select에서 선택한 라벨로 변경된다', async () => {
      const { findByText, getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(await findByText('일주일에 3회'));
      });

      await act(async () => {
        fireEvent.press(getByText('일주일에 5회'));
      });

      expect(getByText('일주일에 5회')).toBeOnTheScreen();
    });

    it('벌금 입력 시 숫자만 입력된다', async () => {
      const { findByPlaceholderText } = render(<RoutineFormModal />);

      const penaltyInput = await findByPlaceholderText(
        '벌금을 입력해주세요.',
      );

      await act(async () => {
        fireEvent.changeText(penaltyInput, 'abc20000');
      });

      // 숫자만 남음 (20000), 포맷팅 적용 (20,000)
      expect(penaltyInput.props.value).toBe('20,000');
    });

    it('벌금 수정 시 천 단위 콤마가 표시된다', async () => {
      const { findByPlaceholderText } = render(<RoutineFormModal />);

      const penaltyInput = await findByPlaceholderText(
        '벌금을 입력해주세요.',
      );

      await act(async () => {
        fireEvent.changeText(penaltyInput, '100000');
      });

      expect(penaltyInput.props.value).toBe('100,000');
    });
  });

  describe('API 통합 테스트', () => {
    describe('루틴 수정 성공 시', () => {
      beforeEach(() => {
        mockAxios.onPut('/routine/1').reply(200, {
          data: APPLIED_UPDATE_RESPONSE,
        });
      });

      it('성공 알림이 표시되고 루틴 페이지로 이동한다', async () => {
        const { findByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        // 루틴 이름 수정
        const routineNameInput =
          await findByPlaceholderText('루틴 이름을 입력하세요.');

        await act(async () => {
          fireEvent.changeText(routineNameInput, '수정된 루틴');
        });

        await waitFor(() => {
          const editButton = getByText('저장');

          expect(editButton).toBeEnabled();
        });

        const editButton = getByText('저장');

        await act(async () => {
          fireEvent.press(editButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith('루틴이 수정되었습니다.');
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });

      it('승인 요청이 생성되면 기존 값 유지 안내 후 루틴 화면으로 이동한다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
        mockRoutineDetail({
          isMe: false,
          mateNickname: '메이트닉네임',
        });
        mockAxios.onPut('/routine/1').reply(200, {
          data: APPROVAL_REQUESTED_UPDATE_RESPONSE,
        });

        const { findByPlaceholderText, findByText } = render(
          <RoutineFormModal />,
        );

        await act(async () => {
          fireEvent.changeText(
            await findByPlaceholderText('루틴 이름을 입력하세요.'),
            '승인 필요한 루틴명',
          );
        });

        const editButton = await findByText('저장');

        await act(async () => {
          fireEvent.press(editButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '메이트 승인 요청이 생성되었습니다. 승인 전까지 기존 루틴 정보가 유지됩니다.',
          );
          expect(mockDismissTo).toHaveBeenCalledWith(
            '/(tabs)/(afterLogin)/(routine)',
          );
        });
      });

      it('컬러만 변경하면 symbolColor만 수정 요청 본문에 포함한다', async () => {
        const { findByTestId, findByText } = render(<RoutineFormModal />);

        await act(async () => {
          fireEvent.press(await findByTestId('routine-color-option-00B8F0'));
        });

        await act(async () => {
          fireEvent.press(await findByText('저장'));
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.put[0]?.data ?? '{}');

          expect(payload).toEqual({
            symbolColor: '#00B8F0',
          });
        });
      });

      it('직접 루틴 수정 시 변경 필드 외 사용자 정보를 전송하지 않는다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
        mockRoutineDetail({
          isMe: true,
          mateNickname: '',
        });
        mockAxios.onPut('/routine/1').reply(200, {
          data: APPLIED_UPDATE_RESPONSE,
        });

        const { findByPlaceholderText, findByText } = render(
          <RoutineFormModal />,
        );

        await act(async () => {
          fireEvent.changeText(
            await findByPlaceholderText('루틴 이름을 입력하세요.'),
            '수정된 직접 루틴',
          );
        });

        const editButton = await findByText('저장');

        await act(async () => {
          fireEvent.press(editButton);
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.put[0]?.data ?? '{}');

          expect(payload).toEqual({ routineName: '수정된 직접 루틴' });
          expect(payload).not.toHaveProperty('nickname');
          expect(payload).not.toHaveProperty('isMe');
          expect(payload).not.toHaveProperty('mateNickname');
        });
      });

      it('메이트 루틴 수정 시 변경 필드 외 사용자 정보를 전송하지 않는다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
        mockRoutineDetail({
          isMe: false,
          mateNickname: '메이트닉네임',
        });
        mockAxios.onPut('/routine/1').reply(200, {
          data: APPLIED_UPDATE_RESPONSE,
        });

        const { findByPlaceholderText, findByText } = render(
          <RoutineFormModal />,
        );

        await act(async () => {
          fireEvent.changeText(
            await findByPlaceholderText('루틴 이름을 입력하세요.'),
            '수정된 메이트 루틴',
          );
        });

        await act(async () => {
          fireEvent.press(await findByText('저장'));
        });

        await waitFor(() => {
          expect(mockAxios.history.put).toHaveLength(1);

          const payload = JSON.parse(mockAxios.history.put[0]?.data ?? '{}');

          expect(payload).toEqual({ routineName: '수정된 메이트 루틴' });
          expect(payload).not.toHaveProperty('nickname');
          expect(payload).not.toHaveProperty('isMe');
          expect(payload).not.toHaveProperty('mateNickname');
        });
      });

      it('시작일과 종료일이 변경되지 않으면 수정 요청 본문에서 제외한다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
        mockRoutineDetail({
          startDate: '2026-07-01',
          endDate: '2026-07-31',
        });
        mockAxios.onPut('/routine/1').reply(200, {
          data: APPLIED_UPDATE_RESPONSE,
        });

        const { findByText } = render(<RoutineFormModal />);

        expect(await findByText('2026-07-01')).toBeOnTheScreen();
        expect(await findByText('2026-07-31')).toBeOnTheScreen();

        await act(async () => {
          fireEvent.press(await findByText('저장'));
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.put[0]?.data ?? '{}');

          expect(payload).not.toHaveProperty('startDate');
          expect(payload).not.toHaveProperty('endDate');
        });
      });

      it('일시정지와 숨김 상태를 수정 요청 본문에 포함한다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
        mockRoutineDetail({
          paused: false,
          hidden: false,
        });
        mockAxios.onPut('/routine/1').reply(200, {
          data: APPLIED_UPDATE_RESPONSE,
        });
        const { findAllByTestId, findByText } = render(<RoutineFormModal />);

        const [pausedCheckbox, hiddenCheckbox] =
          await findAllByTestId('bouncy-checkbox');

        (global as any).mockCheckboxChecked = false;
        await act(async () => {
          fireEvent.press(pausedCheckbox);
        });
        (global as any).mockCheckboxChecked = false;
        await act(async () => {
          fireEvent.press(hiddenCheckbox);
        });

        await act(async () => {
          fireEvent.press(await findByText('저장'));
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.put[0]?.data ?? '{}');

          expect(payload).toEqual(
            expect.objectContaining({
              paused: true,
              hidden: true,
            }),
          );
        });
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPut('/routine/1').reply(500, {
          error: {
            message: '서버 오류가 발생했습니다.',
          },
        });
      });

      it('실패 알림이 표시된다', async () => {
        const { findByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        // 루틴 이름 수정
        const routineNameInput = await findByPlaceholderText(
          '루틴 이름을 입력하세요.',
        );

        await act(async () => {
          fireEvent.changeText(routineNameInput, '수정된 루틴');
        });

        await waitFor(
          () => {
            const editButton = getByText('저장');

            expect(editButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const editButton = getByText('저장');

        await act(async () => {
          fireEvent.press(editButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '서버 오류가 발생했습니다.',
            'error',
          );
        });
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPut('/routine/1').networkError();
      });

      it('실패 알림이 표시된다', async () => {
        const { findByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        // 루틴 이름 수정
        const routineNameInput = await findByPlaceholderText(
          '루틴 이름을 입력하세요.',
        );

        await act(async () => {
          fireEvent.changeText(routineNameInput, '수정된 루틴');
        });

        await waitFor(
          () => {
            const editButton = getByText('저장');

            expect(editButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const editButton = getByText('저장');

        await act(async () => {
          fireEvent.press(editButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            '네트워크 연결을 확인해 주세요.',
            'error',
          );
        });
      });
    });
  });

  describe('취소 버튼 테스트', () => {
    it('취소 버튼은 폼 내부에 표시되지 않는다', async () => {
      const { queryByText } = render(<RoutineFormModal />);

      expect(queryByText('취소')).not.toBeOnTheScreen();
    });

    it('폼 마지막에 루틴 상태 체크박스 항목이 표시된다', async () => {
      const { findAllByTestId, findByTestId, findByText } = render(
        <RoutineFormModal />,
      );

      const [statusSection, statusOptions, pausedLabel, hiddenLabel] =
        await Promise.all([
          findByTestId('routine-status-section'),
          findByTestId('routine-status-options'),
          findByText('루틴 일시정지'),
          findByText('루틴 숨김'),
        ]);
      const statusSectionStyle = RNStyleSheet.flatten(
        statusSection.props.style,
      );
      const statusOptionsStyle = RNStyleSheet.flatten(
        statusOptions.props.style,
      );

      expect(pausedLabel).toBeOnTheScreen();
      expect(hiddenLabel).toBeOnTheScreen();
      expect(pausedLabel.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: palette.theme.gray[90] }),
        ]),
      );
      expect(hiddenLabel.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: palette.theme.gray[90] }),
        ]),
      );
      expect(await findAllByTestId('bouncy-checkbox')).toHaveLength(2);
      expect(statusSectionStyle).toEqual(
        expect.objectContaining({
          gap: 40,
          marginTop: 16,
          paddingBottom: 20,
        }),
      );
      expect(statusOptionsStyle).toEqual(expect.objectContaining({ gap: 16 }));
      expect(statusOptionsStyle).toEqual(
        expect.objectContaining({
          alignItems: 'flex-start',
        }),
      );
    });

    it('기존 루틴의 일시정지와 숨김 상태를 체크박스 초기 상태로 표시한다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        paused: true,
        hidden: true,
      });
      const { findAllByTestId } = render(<RoutineFormModal />);

      const [pausedCheckbox, hiddenCheckbox] =
        await findAllByTestId('bouncy-checkbox');

      expect(pausedCheckbox.props.isChecked).toBe(true);
      expect(hiddenCheckbox.props.isChecked).toBe(true);
    });

    it('루틴 폼 스크롤 콘텐츠의 하단 여백을 항목 간격과 동일하게 둔다', async () => {
      const { findByTestId } = render(<RoutineFormModal />);
      const scrollView = await findByTestId('routine-form-scroll');

      const scrollContentStyle = RNStyleSheet.flatten(
        scrollView.props.contentContainerStyle,
      );

      expect(scrollView.props.showsVerticalScrollIndicator).toBe(
        SHOW_SCROLL_INDICATOR,
      );
      expect(scrollContentStyle.paddingBottom).toBe(baseFoundation.spacing[6]);
    });

    it('루틴 삭제 버튼을 고정 danger outline 스타일로 표시한다', async () => {
      const { findByTestId, findByText } = render(<RoutineFormModal />);

      const deleteButtonStyle = RNStyleSheet.flatten(
        (await findByTestId('routine-delete-button')).props.style,
      );
      const deleteButtonTextStyle = RNStyleSheet.flatten(
        (await findByText('루틴 삭제')).props.style,
      );

      expect(deleteButtonStyle).toEqual(
        expect.objectContaining({
          height: 44,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#C73FA7',
          backgroundColor: '#FFFFFF',
        }),
      );
      expect(deleteButtonTextStyle).toEqual(
        expect.objectContaining({
          color: '#C73FA7',
          fontSize: 14,
          fontWeight: '400',
        }),
      );
    });

    it('루틴 삭제 버튼 클릭 시 확인 Alert이 표시된다', async () => {
      const { findByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(await findByText('루틴 삭제'));
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

    it('폼 렌더링만으로 이전 페이지 이동을 실행하지 않는다', async () => {
      render(<RoutineFormModal />);

      expect(mockBack).not.toHaveBeenCalled();
    });
  });
});
