import axiosInstance from '@repo/shared/api';
import { getFormatDate } from '@repo/shared/utils';
import { act, screen, waitFor, within } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { type ReactElement, useContext } from 'react';
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
declare const mockPush: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
  routineForm: Record<string, unknown>;
  setRoutineForm: jest.Mock;
  routineDateSelection: null | {
    initialStartDate: string | null;
    initialEndDate: string | null;
    confirmedStartDate: string | null;
    confirmedEndDate: string | null;
  };
  beginRoutineDateSelection: jest.Mock;
  confirmRoutineDateSelection: jest.Mock;
  clearRoutineDateSelection: jest.Mock;
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
      fillColor,
      disableText,
      isChecked,
      onPress,
      text,
      textStyle,
    }: {
      disableText?: boolean;
      fillColor?: string;
      isChecked?: boolean;
      onPress: (checked: boolean) => void;
      text?: string;
      textStyle?: object;
    }) => {
      return React.createElement(
        View,
        {
          testID: 'bouncy-checkbox',
          disableText,
          fillColor,
          isChecked,
          onPress: () => {
            (global as any).mockCheckboxChecked = !(global as any)
              .mockCheckboxChecked;
            onPress((global as any).mockCheckboxChecked);
          },
        },
        text ? React.createElement(Text, { style: textStyle }, text) : null,
      );
    },
  };
});

// axios mock adapter
let mockAxios: MockAdapter;
const mockAlert = jest.spyOn(Alert, 'alert');

const ModalHeaderActionOutlet = () => {
  const context = useContext(ModalHeaderActionContext);

  return context?.action ?? null;
};

const render = (ui: ReactElement) =>
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
  const MockModalHeaderActionContext =
    require('@/components/modal/modal-header-action-context').default;

  const MockModalHeader = ({ title }: { title: string }) => {
    const context = React.useContext(MockModalHeaderActionContext);

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
      symbolColor: '#3C9FFF',
    };
    mockRoutineStore.routineId = 0;
    mockRoutineStore.routineDateSelection = null;
    mockRoutineStore.beginRoutineDateSelection.mockReset();
    mockRoutineStore.confirmRoutineDateSelection.mockReset();
    mockRoutineStore.clearRoutineDateSelection.mockReset();
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
          getByPlaceholderText('루틴 설명을 입력하세요.'),
          data.routineDetail,
        );
      });
    }
    if (data.penalty) {
      await act(async () => {
        fireEvent.changeText(screen.getByTestId('penalty-input'), data.penalty);
      });
    }
    if (data.routineCount) {
      await act(async () => {
        fireEvent.press(getByText('루틴 횟수를 선택하세요.'));
      });

      await act(async () => {
        fireEvent.press(getByText(`일주일에 ${data.routineCount}회`));
      });
    }
  };

  const getStartOfToday = () => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    return today;
  };

  const setInitialStartDate = (date = getStartOfToday()) => {
    mockRoutineStore.routineForm.startDate = getFormatDate(date);
  };

  // 모든 필수 필드 입력 헬퍼 함수
  // isMe가 이미 true로 설정되어 있으므로 체크박스 클릭 불필요
  const fillAllRequiredFields = async (
    getByPlaceholderText: (text: string) => any,
    getByText: (text: string) => any,
  ) => {
    // API 호출이 완료될 때까지 대기
    await waitFor(() => {
      expect(mockAxios.history.get.length).toBeGreaterThan(0);
    });

    await fillForm(getByPlaceholderText, getByText, {
      routineName: '테스트 루틴',
      routineDetail: '테스트 설명',
      routineCount: 3,
    });
  };

  describe('필수값 입력 전 추가 버튼 비활성화 테스트', () => {
    it('날짜 선택 버튼을 누르면 날짜 선택 페이지로 이동한다', async () => {
      const { getByTestId, queryByLabelText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByTestId('routine-date-button'));
      });

      expect(mockRoutineStore.beginRoutineDateSelection).toHaveBeenCalledTimes(
        1,
      );
      expect(mockRoutineStore.beginRoutineDateSelection).toHaveBeenCalledWith(
        '2026-07-31',
        null,
      );
      expect(mockPush).toHaveBeenCalledWith('/routine-date-select');
      expect(queryByLabelText('날짜 선택 바텀 시트')).not.toBeOnTheScreen();
    });

    it('날짜 선택 페이지에서 확정한 날짜를 폼에 반영한다', async () => {
      const confirmedStartDate = '2026-08-01';
      const confirmedEndDate = '2026-08-07';

      mockRoutineStore.routineDateSelection = {
        initialStartDate: confirmedStartDate,
        initialEndDate: confirmedEndDate,
        confirmedStartDate,
        confirmedEndDate,
      };
      mockRoutineStore.clearRoutineDateSelection.mockImplementation(() => {
        mockRoutineStore.routineDateSelection = null;
      });

      const { findByText } = render(<RoutineFormModal />);

      expect(
        await findByText(`${confirmedStartDate} ~ ${confirmedEndDate}`),
      ).toBeOnTheScreen();
      expect(mockRoutineStore.clearRoutineDateSelection).toHaveBeenCalledTimes(
        1,
      );
    });

    it('매일 반복을 선택하면 표시된 날짜를 유지하고 날짜 선택 버튼을 비활성화한다', async () => {
      const { getAllByTestId, getByTestId, getByText } = render(
        <RoutineFormModal />,
      );

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[0]);
      });

      expect(getByText('매일 반복')).toBeOnTheScreen();
      expect(getByText('2026-07-31')).toBeOnTheScreen();
      expect(getByTestId('routine-daily-repeat-date-button')).toBeDisabled();

      await act(async () => {
        fireEvent.press(getByTestId('routine-daily-repeat-date-button'));
      });

      expect(mockRoutineStore.beginRoutineDateSelection).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/routine-date-select');
    });

    it('메이트에게 루틴 인증 요청을 기본 해제하고 메이트와 벌금 입력을 숨긴다', () => {
      const {
        getAllByTestId,
        getByText,
        queryByPlaceholderText,
        queryByTestId,
      } = render(<RoutineFormModal />);
      const mateCheckbox = getAllByTestId('bouncy-checkbox')[1];

      expect(getByText('메이트에게 루틴 인증 요청')).toHaveStyle({
        color: '#272A2D',
      });
      expect(mateCheckbox.props.isChecked).toBe(false);
      expect(mateCheckbox.props.fillColor).toBe('#000306');
      expect(queryByPlaceholderText('친구를 선택하세요')).not.toBeOnTheScreen();
      expect(queryByTestId('penalty-input')).not.toBeOnTheScreen();
    });

    it('메이트에게 루틴 인증 요청 라벨을 누르면 체크된다', async () => {
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('메이트에게 루틴 인증 요청'));
      });

      expect(getByPlaceholderText('친구를 선택하세요')).toBeOnTheScreen();
    });

    it('메이트 루틴 입력에서는 체크해줄 친구를 필수로, 벌금을 선택항목으로 표시한다', async () => {
      const { getAllByTestId, getByTestId } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      const mateLabelRow = within(getByTestId('mateNickname-label-row'));
      const penaltyLabelRow = within(getByTestId('penalty-label-row'));
      const penaltyOptional = penaltyLabelRow.getByText('선택');

      expect(mateLabelRow.getByText('체크해줄 친구')).toBeOnTheScreen();
      expect(mateLabelRow.getByText('*')).toBeOnTheScreen();
      expect(penaltyLabelRow.getByText('벌금')).toBeOnTheScreen();
      expect(penaltyOptional).toBeOnTheScreen();
      expect(penaltyOptional.props.fontSize).toBe('$caption2');
    });

    it('벌금 입력은 기본값 0과 고정 원 단위를 우측 정렬로 표시한다', async () => {
      mockRoutineStore.routineForm.penalty = 0;
      const { getAllByTestId, getByTestId } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      const penaltyInput = getByTestId('penalty-input');
      const penaltyDisplay = getByTestId('penalty-input-display');

      expect(penaltyInput.props.placeholder).toBeUndefined();
      expect(penaltyInput.props.value).toBeUndefined();
      expect(penaltyInput.props.defaultValue).toBe('0');
      expect(penaltyDisplay.props.value).toBe('0');
      expect(penaltyDisplay).toHaveStyle({ textAlign: 'right' });
      expect(getByTestId('penalty-input-container')).toHaveStyle({
        flexDirection: 'row',
        alignItems: 'center',
      });
      expect(getByTestId('penalty-unit')).toHaveTextContent('원');
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

    it('모든 필드가 비어있을 때 추가 버튼이 비활성화되어 있다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const addButton = getByText('생성');

      expect(addButton).toBeDisabled();
    });

    it('모든 필수값 입력 시 혼자 루틴 추가 버튼이 활성화된다', async () => {
      setInitialStartDate();
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      await fillAllRequiredFields(getByPlaceholderText, getByText);

      await waitFor(
        () => {
          const addButton = getByText('생성');

          expect(addButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('벌금 없이 필수값을 입력하면 추가 버튼이 활성화된다', async () => {
      setInitialStartDate();
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await fillForm(getByPlaceholderText, getByText, {
        routineName: '테스트 루틴',
        routineDetail: '테스트 설명',
        routineCount: 3,
      });

      await waitFor(
        () => {
          const addButton = getByText('생성');

          expect(addButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });

    it('루틴 설명 없이 필수값을 입력하면 추가 버튼이 활성화된다', async () => {
      setInitialStartDate();
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      await waitFor(() => {
        expect(mockAxios.history.get.length).toBeGreaterThan(0);
      });

      await fillForm(getByPlaceholderText, getByText, {
        routineName: '테스트 루틴',
        routineCount: 3,
      });

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
    it('메이트 선택 버튼을 누르면 전체 친구 목록을 바로 표시한다', async () => {
      const { getAllByTestId, getByLabelText, getByTestId, getByText } = render(
        <RoutineFormModal />,
      );

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      await waitFor(() => {
        expect(
          mockAxios.history.get.some(({ url }) => url === '/friends'),
        ).toBe(true);
      });

      await act(async () => {
        fireEvent.press(getByLabelText('친구를 선택하세요'));
      });

      expect(getByText('friend1')).toBeOnTheScreen();
      expect(getByText('friend2')).toBeOnTheScreen();
      expect(getByText('friend3')).toBeOnTheScreen();
      expect(
        getByTestId('autocomplete-option-image-friend1').props.source,
      ).toEqual({
        uri: expect.stringContaining(
          '/assets/characters/mage_intermediate.png',
        ),
      });
    });

    it('메이트 드롭다운 외부를 누르면 친구 목록을 닫는다', async () => {
      const {
        getAllByTestId,
        getByLabelText,
        getByTestId,
        getByText,
        queryByText,
      } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      await waitFor(() => {
        expect(
          mockAxios.history.get.some(({ url }) => url === '/friends'),
        ).toBe(true);
      });

      await act(async () => {
        fireEvent.press(getByLabelText('친구를 선택하세요'));
      });

      expect(getByText('friend1')).toBeOnTheScreen();

      await act(async () => {
        getByTestId('routine-form-scroll').props.onTouchStart?.();
      });

      expect(queryByText('friend1')).not.toBeOnTheScreen();
    });

    it('메이트 버튼의 친구를 선택하면 선택값을 표시하고 목록을 닫는다', async () => {
      const {
        getAllByTestId,
        getByDisplayValue,
        getByLabelText,
        getByText,
        queryByText,
      } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      await act(async () => {
        fireEvent.press(getByLabelText('친구를 선택하세요'));
      });

      await act(async () => {
        fireEvent.press(getByText('friend2'));
      });

      expect(getByDisplayValue('friend2')).toBeOnTheScreen();
      expect(queryByText('friend1')).not.toBeOnTheScreen();
      expect(queryByText('friend3')).not.toBeOnTheScreen();
    });

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
          getByTestId('routine-color-option-3C9FFF').props.style,
        ),
      ).toMatchObject({
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 3,
        borderColor: '#FFFFFF',
      });
      expect(
        getByLabelText('컬러 파랑 선택됨').props.accessibilityState,
      ).toEqual({ selected: true });

      await act(async () => {
        fireEvent.press(getByLabelText('컬러 하늘 선택'));
      });

      expect(
        getByLabelText('컬러 하늘 선택됨').props.accessibilityState,
      ).toEqual({ selected: true });
    });

    it('루틴 횟수는 1회부터 7회까지 Select 옵션으로 선택한다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('루틴 횟수를 선택하세요.'));
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
      const { getAllByTestId, getByTestId } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      const penaltyInput = getByTestId('penalty-input');

      await act(async () => {
        fireEvent.changeText(penaltyInput, 'abc1000');
      });

      // 숫자만 남음 (1000), 포맷팅 적용 (1,000)
      expect(getByTestId('penalty-input-display').props.value).toBe('1,000');
    });

    it('벌금 입력 시 천 단위 콤마가 표시된다', async () => {
      const { getAllByTestId, getByTestId } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      const penaltyInput = getByTestId('penalty-input');

      await act(async () => {
        fireEvent.changeText(penaltyInput, '10000');
      });

      expect(getByTestId('penalty-input-display').props.value).toBe('10,000');
    });

    it('벌금이 1억을 초과하면 즉시 1억으로 제한한다', async () => {
      const { getAllByTestId, getByTestId } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      const penaltyInput = getByTestId('penalty-input');

      await act(async () => {
        fireEvent.changeText(penaltyInput, '100000001');
      });

      expect(getByTestId('penalty-input-display').props.value).toBe(
        '100,000,000',
      );
    });

    it('벌금 입력값을 모두 지우면 0을 표시한다', async () => {
      const { getAllByTestId, getByTestId } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
      });

      const penaltyInput = getByTestId('penalty-input');

      await act(async () => {
        fireEvent.changeText(penaltyInput, '10000');
        fireEvent.changeText(penaltyInput, '');
      });

      expect(getByTestId('penalty-input-display').props.value).toBe('0');
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
        setInitialStartDate();
        const { getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(getByPlaceholderText, getByText);

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
        setInitialStartDate();
        const { getByPlaceholderText, getByText } = render(
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
            symbolColor: '#3C9FFF',
            hidden: false,
          });
          expect(payload).not.toHaveProperty('nickname');
          expect(payload).not.toHaveProperty('isMe');
          expect(payload).not.toHaveProperty('penalty');
          expect(payload).not.toHaveProperty('mateNickname');
          expect(payload).not.toHaveProperty('endDate');
        });
      });

      it('숨김 체크 시 생성 요청에 hidden true를 보낸다', async () => {
        setInitialStartDate();
        const {
          getAllByTestId,
          getByLabelText,
          getByPlaceholderText,
          getByText,
        } = render(<RoutineFormModal />);

        await act(async () => {
          fireEvent.press(getAllByTestId('bouncy-checkbox')[2]);
        });

        await fillAllRequiredFields(getByPlaceholderText, getByText);

        await waitFor(() => {
          expect(getByText('생성')).toBeEnabled();
        });

        await act(async () => {
          fireEvent.press(getByText('생성'));
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.post[0]?.data ?? '{}');

          expect(payload.hidden).toBe(true);
        });
      });

      it('메이트에게 루틴 인증 요청 선택 시 메이트 루틴 API에 벌금과 메이트를 보낸다', async () => {
        mockAxios.onPost('/routine/mate').reply(201, {
          data: { message: '메이트 루틴이 성공적으로 등록되었습니다.' },
        });
        setInitialStartDate();
        const { getAllByTestId, getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await act(async () => {
          fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
        });

        await act(async () => {
          fireEvent.press(getByLabelText('친구를 선택하세요'));
        });

        await waitFor(() => {
          expect(getByText('friend1')).toBeOnTheScreen();
        });

        await act(async () => {
          fireEvent.press(getByText('friend1'));
        });

        await fillForm(getByPlaceholderText, getByText, {
          routineName: '메이트 루틴',
          routineDetail: '함께 달리기',
          penalty: '5000',
          routineCount: 3,
        });

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
            symbolColor: '#3C9FFF',
            penalty: 5000,
            mateNickname: 'friend1',
          });
          expect(payload).not.toHaveProperty('nickname');
          expect(payload).not.toHaveProperty('isMe');
          expect(payload).not.toHaveProperty('endDate');
        });
      });

      it('메이트 루틴 생성 시 벌금을 비우면 penalty를 보내지 않는다', async () => {
        mockAxios.onPost('/routine/mate').reply(201, {
          data: { message: '메이트 루틴이 성공적으로 등록되었습니다.' },
        });
        setInitialStartDate();
        const {
          getAllByTestId,
          getByLabelText,
          getByPlaceholderText,
          getByText,
        } = render(<RoutineFormModal />);

        await act(async () => {
          fireEvent.press(getAllByTestId('bouncy-checkbox')[1]);
        });

        await act(async () => {
          fireEvent.press(getByLabelText('친구를 선택하세요'));
        });

        await waitFor(() => {
          expect(getByText('friend1')).toBeOnTheScreen();
        });

        await act(async () => {
          fireEvent.press(getByText('friend1'));
        });

        await fillForm(getByPlaceholderText, getByText, {
          routineName: '벌금 없는 메이트 루틴',
          routineDetail: '함께 달리기',
          routineCount: 3,
        });

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
            routineName: '벌금 없는 메이트 루틴',
            routineDetail: '함께 달리기',
            routineCount: 3,
            symbolColor: '#3C9FFF',
            mateNickname: 'friend1',
          });
          expect(payload).not.toHaveProperty('penalty');
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
        setInitialStartDate();
        const { getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(getByPlaceholderText, getByText);

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
        setInitialStartDate();
        const { getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(getByPlaceholderText, getByText);

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

    it('비공개 루틴 체크박스를 기본 해제 상태로 표시한다', async () => {
      const { getAllByTestId, getByText, queryByText } = render(
        <RoutineFormModal />,
      );

      expect(queryByText('루틴 일시정지')).not.toBeOnTheScreen();
      expect(getByText('비공개 루틴')).toBeOnTheScreen();
      expect(queryByText('메이트에게는 공개됩니다')).not.toBeOnTheScreen();
      expect(getAllByTestId('bouncy-checkbox')[2].props.isChecked).toBe(false);
    });

    it('비공개 루틴 라벨 오른쪽에 원형 물음표 아이콘을 표시한다', () => {
      const { getAllByTestId, getByLabelText, getByTestId, queryByTestId } =
        render(<RoutineFormModal />);
      const labelRow = getByTestId('hidden-routine-label-row');
      const hiddenCheckbox = getAllByTestId('bouncy-checkbox')[2];
      const hiddenLabel = getByTestId('hidden-routine-label');
      const helpButton = getByLabelText('비공개 루틴 안내 보기');
      const helpIcon = getByTestId('hidden-routine-help-icon', {
        includeHiddenElements: true,
      });

      expect(helpButton).toBeOnTheScreen();
      expect(hiddenCheckbox.props.disableText).toBe(true);
      expect(hiddenLabel).toHaveTextContent('비공개 루틴');
      expect(queryByTestId('hidden-routine-info-icon')).not.toBeOnTheScreen();
      expect(RNStyleSheet.flatten(labelRow.props.style)).toEqual(
        expect.objectContaining({
          flexDirection: 'row',
          alignItems: 'center',
        }),
      );
      expect(helpIcon.props).toEqual(
        expect.objectContaining({
          name: 'help-circle-outline',
          size: baseFoundation.iconSize.m,
          color: palette.theme.gray[90],
        }),
      );
    });

    it('원형 물음표 아이콘을 누르면 메이트 공개 안내를 팝오버로 표시한다', () => {
      const { getByLabelText, getByTestId, getByText, queryByTestId } = render(
        <RoutineFormModal />,
      );

      expect(
        queryByTestId('hidden-routine-info-popover'),
      ).not.toBeOnTheScreen();

      fireEvent.press(getByLabelText('비공개 루틴 안내 보기'));

      const popover = getByTestId('hidden-routine-info-popover');

      expect(getByText('메이트에게는 공개됩니다')).toBeOnTheScreen();
      expect(RNStyleSheet.flatten(popover.props.style)).toEqual(
        expect.objectContaining({
          position: 'absolute',
          top: baseFoundation.dimension.x24 + baseFoundation.spacing[0.5],
          width: 220,
          zIndex: baseFoundation.zIndex.tooltip,
        }),
      );

      fireEvent.press(getByLabelText('비공개 루틴 안내 닫기'));

      expect(
        queryByTestId('hidden-routine-info-popover'),
      ).not.toBeOnTheScreen();
    });

    it('비공개 루틴 라벨을 누르면 체크된다', async () => {
      const { getAllByTestId, getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('비공개 루틴'));
      });

      expect(getAllByTestId('bouncy-checkbox')[2].props.isChecked).toBe(true);
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
      const { findByPlaceholderText, findByTestId, findByText } = render(
        <RoutineFormModal />,
      );

      // 기존 루틴 이름이 표시되어야 함
      const routineNameInput =
        await findByPlaceholderText('루틴 이름을 입력하세요.');

      expect(routineNameInput.props.value).toBe('기존 루틴');

      // 기존 루틴 설명이 표시되어야 함
      const routineDetailInput =
        await findByPlaceholderText('루틴 설명을 입력하세요.');

      expect(routineDetailInput.props.value).toBe('기존 설명');

      // 기존 루틴 횟수가 표시되어야 함
      expect(await findByText('일주일에 3회')).toBeOnTheScreen();

      expect(await findByText('매일 반복')).toBeOnTheScreen();
      expect(
        await findByTestId('routine-daily-repeat-date-button'),
      ).toBeDisabled();
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

      const { getAllByTestId, getByPlaceholderText, getByTestId, getByText } =
        render(<RoutineFormModal />);

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
      expect(getByPlaceholderText('루틴 설명을 입력하세요.').props.value).toBe(
        '상세 설명',
      );
      expect(getByText('일주일에 5회')).toBeOnTheScreen();
      expect(getByText('2026-05-26')).toBeOnTheScreen();
      expect(getByTestId('routine-daily-repeat-date-button')).toBeDisabled();
      expect(getAllByTestId('bouncy-checkbox')[0].props.isChecked).toBe(true);
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
      expect(queryByText('메이트에게 루틴 인증 요청')).not.toBeOnTheScreen();
      expect(queryByPlaceholderText('친구를 선택하세요')).not.toBeOnTheScreen();
    });

    it('메이트가 지정되지 않은 루틴은 메이트 항목을 표시하지 않는다', async () => {
      const { findByPlaceholderText, queryByPlaceholderText, queryByText } =
        render(<RoutineFormModal />);

      expect(
        await findByPlaceholderText('루틴 이름을 입력하세요.'),
      ).toBeOnTheScreen();
      expect(queryByText('메이트')).not.toBeOnTheScreen();
      expect(queryByText('메이트에게 루틴 인증 요청')).not.toBeOnTheScreen();
      expect(queryByPlaceholderText('친구를 선택하세요')).not.toBeOnTheScreen();
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
      const { findByPlaceholderText, getByText } = render(<RoutineFormModal />);

      const routineNameInput =
        await findByPlaceholderText('루틴 이름을 입력하세요.');

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

      expect(await findByText('루틴 횟수를 선택하세요.')).toBeOnTheScreen();

      await waitFor(() => {
        const editButton = getByText('저장');

        expect(editButton).toBeDisabled();
      });
    });

    it('모든 필수값이 유효하고 값 변경 시 수정 버튼이 활성화된다', async () => {
      const { findByPlaceholderText, getByText } = render(<RoutineFormModal />);

      // 입력값이 올바르게 설정되었는지 확인
      const routineNameInput =
        await findByPlaceholderText('루틴 이름을 입력하세요.');

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
        await findByPlaceholderText('루틴 설명을 입력하세요.');

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
      expect(queryByPlaceholderText('친구를 선택하세요')).not.toBeOnTheScreen();
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
      expect(queryByPlaceholderText('친구를 선택하세요')).not.toBeOnTheScreen();
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
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        mateNickname: '메이트닉네임',
        isMe: false,
      });

      const { findByTestId, getByTestId } = render(<RoutineFormModal />);

      const penaltyInput = await findByTestId('penalty-input');

      await act(async () => {
        fireEvent.changeText(penaltyInput, 'abc20000');
      });

      // 숫자만 남음 (20000), 포맷팅 적용 (20,000)
      expect(penaltyInput.props.placeholder).toBeUndefined();
      expect(getByTestId('penalty-input-display').props.value).toBe('20,000');
      expect(getByTestId('penalty-unit')).toHaveTextContent('원');
    });

    it('벌금 수정 시 천 단위 콤마가 표시된다', async () => {
      mockAxios.resetHandlers();
      mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
      mockRoutineDetail({
        mateNickname: '메이트닉네임',
        isMe: false,
      });

      const { findByTestId, getByTestId } = render(<RoutineFormModal />);

      const penaltyInput = await findByTestId('penalty-input');

      await act(async () => {
        fireEvent.changeText(penaltyInput, '100000');
      });

      expect(getByTestId('penalty-input-display').props.value).toBe('100,000');
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
          fireEvent.press(await findByTestId('routine-color-option-30C2F1'));
        });

        await act(async () => {
          fireEvent.press(await findByText('저장'));
        });

        await waitFor(() => {
          const payload = JSON.parse(mockAxios.history.put[0]?.data ?? '{}');

          expect(payload).toEqual({
            symbolColor: '#30C2F1',
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

        expect(await findByText('2026-07-01 ~ 2026-07-31')).toBeOnTheScreen();

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

        const [, pausedCheckbox, hiddenCheckbox] =
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
        const routineNameInput =
          await findByPlaceholderText('루틴 이름을 입력하세요.');

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
        const routineNameInput =
          await findByPlaceholderText('루틴 이름을 입력하세요.');

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
          findByText('비공개 루틴'),
        ]);
      const statusSectionStyle = RNStyleSheet.flatten(
        statusSection.props.style,
      );
      const statusOptionsStyle = RNStyleSheet.flatten(
        statusOptions.props.style,
      );

      expect(pausedLabel).toBeOnTheScreen();
      expect(hiddenLabel).toBeOnTheScreen();
      expect(
        await findByTestId('hidden-routine-help-icon', {
          includeHiddenElements: true,
        }),
      ).toBeOnTheScreen();
      expect(pausedLabel).toHaveStyle({ color: palette.theme.gray[90] });
      expect(hiddenLabel).toHaveStyle({ color: palette.theme.gray[90] });
      expect(await findAllByTestId('bouncy-checkbox')).toHaveLength(3);
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

      const [, pausedCheckbox, hiddenCheckbox] =
        await findAllByTestId('bouncy-checkbox');

      expect(pausedCheckbox.props.isChecked).toBe(true);
      expect(hiddenCheckbox.props.isChecked).toBe(true);
    });

    it('루틴 일시정지 라벨을 누르면 체크된다', async () => {
      (global as any).mockCheckboxChecked = false;
      const { findAllByTestId, findByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(await findByText('루틴 일시정지'));
      });

      const [, pausedCheckbox] = await findAllByTestId('bouncy-checkbox');

      expect(pausedCheckbox.props.isChecked).toBe(true);
    });

    it('비공개 루틴 라벨을 누르면 체크된다', async () => {
      (global as any).mockCheckboxChecked = false;
      const { findAllByTestId, findByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(await findByText('비공개 루틴'));
      });

      const [, , hiddenCheckbox] = await findAllByTestId('bouncy-checkbox');

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
