import axiosInstance from '@repo/shared/api';
import { getFormatDate, getThisWeekMonday } from '@repo/shared/utils';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { StyleSheet as RNStyleSheet } from 'react-native';

import ModalScreen from '../../../app/modal';
import RoutineFormModal from '../../../components/modal/routine-form-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockFriends } from '../../setup/friend/mock';

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockBack: jest.Mock;
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

  const { TouchableOpacity, Text } = require('react-native');

  return {
    __esModule: true,
    default: ({
      onPress,
      text,
    }: {
      onPress: (checked: boolean) => void;
      text?: string;
    }) => {
      return React.createElement(
        TouchableOpacity,
        {
          testID: 'bouncy-checkbox',
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

// useDebounce mock - 즉시 값을 반환하여 debounce 지연 제거
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

jest.mock('@/hooks/useModal', () => ({
  useModal: (type: string) => {
    const RoutineFormModal =
      require('@/components/modal/routine-form-modal').default;

    return [
      type === 'routine-update' ? '루틴 수정' : '루틴 추가',
      RoutineFormModal,
    ];
  },
}));

jest.mock('@/components/modal/modal-header', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return ({ title }: { title: string }) =>
    React.createElement(Text, null, title);
});

describe('RoutineFormModal (루틴 추가 모달)', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockSearchParams.type = 'routine-add';
    // RoutineForm 타입에 맞는 초기값 설정
    // isMe: true로 설정하여 mateNickname 검증 우회
    // 숫자 필드는 빈 문자열로 설정 (입력 전 상태)
    mockRoutineStore.routineForm = {
      nickname: '',
      routineName: '',
      routineDetail: '',
      penalty: '',
      routineCount: '',
      mateNickname: '',
      isMe: true, // 직접 체크 기본값
      startDate: '',
      endDate: '',
    };
    mockRoutineStore.routineId = 0;
    (global as any).mockCheckboxChecked = false;
    mockShowToast.mockClear();

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
    it('추가 버튼은 modal.tsx의 고정 footer에 표시된다', () => {
      const { getByTestId, getByText, queryByText } = render(<ModalScreen />);

      const buttonContainerStyle = RNStyleSheet.flatten(
        getByTestId('routine-form-button-container').props.style,
      );

      expect(getByTestId('modal-footer')).toBeOnTheScreen();
      expect(queryByText('취소')).not.toBeOnTheScreen();
      expect(getByText('추가')).toBeOnTheScreen();
      expect(buttonContainerStyle).toMatchObject({
        flexDirection: 'row',
        borderTopWidth: RNStyleSheet.hairlineWidth,
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
      const { getByLabelText, getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('시작일 선택'));
      });

      expect(getByLabelText('시작일 선택 바텀 시트')).toBeOnTheScreen();
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
      expect(
        getByLabelText(`${getFormatDate(today)} 선택 가능`),
      ).toBeEnabled();
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

      const addButton = getByText('추가');

      expect(addButton).toBeDisabled();
    });

    it('모든 필수값 입력 + 직접 루틴 체크 시 추가 버튼이 활성화된다', async () => {
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
          const addButton = getByText('추가');

          expect(addButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('사용자 인풋 유효성 검사 테스트', () => {
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
        mockAxios.onPost('/routine').reply(200, { data: null });
      });

      it('성공 알림이 표시되고 이전 페이지로 돌아간다', async () => {
        const { getByLabelText, getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(
          getByPlaceholderText,
          getByText,
          getByLabelText,
        );

        await waitFor(() => {
          const addButton = getByText('추가');

          expect(addButton).toBeEnabled();
        });

        const addButton = getByText('추가');

        await act(async () => {
          fireEvent.press(addButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith('루틴이 생성되었습니다.');
          expect(mockBack).toHaveBeenCalled();
        });
      });
    });

    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost('/routine').reply(500, {
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
            const addButton = getByText('추가');

            expect(addButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const addButton = getByText('추가');

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
        mockAxios.onPost('/routine').networkError();
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
            const addButton = getByText('추가');

            expect(addButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const addButton = getByText('추가');

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

    // 친구 목록 API 기본 목킹
    mockAxios.onGet(/\/friends/).reply(200, { data: createMockFriends(3) });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('초기 렌더링 테스트', () => {
    it('기존 루틴 데이터가 폼에 표시된다', async () => {
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      // 기존 루틴 이름이 표시되어야 함
      const routineNameInput = getByPlaceholderText('루틴 이름을 입력하세요.');

      expect(routineNameInput.props.value).toBe('기존 루틴');

      // 기존 루틴 설명이 표시되어야 함
      const routineDetailInput =
        getByPlaceholderText('루틴 설명을 입력해주세요.');

      expect(routineDetailInput.props.value).toBe('기존 설명');

      // 기존 벌금이 표시되어야 함 (천 단위 콤마 적용)
      const penaltyInput = getByPlaceholderText('벌금을 입력해주세요.');

      expect(penaltyInput.props.value).toBe('5,000');

      // 기존 루틴 횟수가 표시되어야 함
      expect(getByText('일주일에 3회')).toBeOnTheScreen();

      // 시작 날짜가 표시되어야 함
      expect(getByText('2025-01-06')).toBeOnTheScreen();
    });

    it('수정 버튼이 화면에 표시된다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const editButton = getByText('수정');

      expect(editButton).toBeOnTheScreen();
    });

    it('취소 버튼이 화면에 표시된다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const cancelButton = getByText('취소');

      expect(cancelButton).toBeOnTheScreen();
    });
  });

  describe('필수값 유효성 검사 테스트', () => {
    it('루틴 이름을 비우면 수정 버튼이 비활성화된다', async () => {
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      const routineNameInput = getByPlaceholderText('루틴 이름을 입력하세요.');

      await act(async () => {
        fireEvent.changeText(routineNameInput, '');
      });

      await waitFor(() => {
        const editButton = getByText('수정');

        expect(editButton).toBeDisabled();
      });
    });

    it('루틴 횟수를 비우면 수정 버튼이 비활성화된다', async () => {
      mockRoutineStore.routineForm = {
        ...mockRoutineStore.routineForm,
        routineCount: '',
      };

      const { getByText } = render(<RoutineFormModal />);

      expect(getByText('루틴 횟수를 선택해주세요.')).toBeOnTheScreen();

      await waitFor(() => {
        const editButton = getByText('수정');

        expect(editButton).toBeDisabled();
      });
    });

    it('모든 필수값이 유효하고 값 변경 시 수정 버튼이 활성화된다', async () => {
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      // 입력값이 올바르게 설정되었는지 확인
      const routineNameInput = getByPlaceholderText('루틴 이름을 입력하세요.');

      expect(routineNameInput.props.value).toBe('기존 루틴');

      // 값을 변경하여 유효성 검사 트리거
      await act(async () => {
        fireEvent.changeText(routineNameInput, '수정된 루틴');
      });

      // 폼이 렌더링되고 유효성 검사가 완료될 때까지 대기
      await waitFor(
        () => {
          const editButton = getByText('수정');

          expect(editButton).toBeEnabled();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('사용자 인풋 유효성 검사 테스트', () => {
    it('루틴 횟수는 Select에서 선택한 라벨로 변경된다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      await act(async () => {
        fireEvent.press(getByText('일주일에 3회'));
      });

      await act(async () => {
        fireEvent.press(getByText('일주일에 5회'));
      });

      expect(getByText('일주일에 5회')).toBeOnTheScreen();
    });

    it('벌금 입력 시 숫자만 입력된다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const penaltyInput = getByPlaceholderText('벌금을 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(penaltyInput, 'abc20000');
      });

      // 숫자만 남음 (20000), 포맷팅 적용 (20,000)
      expect(penaltyInput.props.value).toBe('20,000');
    });

    it('벌금 수정 시 천 단위 콤마가 표시된다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const penaltyInput = getByPlaceholderText('벌금을 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(penaltyInput, '100000');
      });

      expect(penaltyInput.props.value).toBe('100,000');
    });
  });

  describe('API 통합 테스트', () => {
    describe('루틴 수정 성공 시', () => {
      beforeEach(() => {
        mockAxios.onPut('/routine/1').reply(200, { data: null });
      });

      it('성공 알림이 표시되고 이전 페이지로 돌아간다', async () => {
        const { getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        // 루틴 이름 수정
        const routineNameInput =
          getByPlaceholderText('루틴 이름을 입력하세요.');

        await act(async () => {
          fireEvent.changeText(routineNameInput, '수정된 루틴');
        });

        await waitFor(() => {
          const editButton = getByText('수정');

          expect(editButton).toBeEnabled();
        });

        const editButton = getByText('수정');

        await act(async () => {
          fireEvent.press(editButton);
        });

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith('루틴이 수정되었습니다.');
          expect(mockBack).toHaveBeenCalled();
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
        const { getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        // 루틴 이름 수정
        const routineNameInput =
          getByPlaceholderText('루틴 이름을 입력하세요.');

        await act(async () => {
          fireEvent.changeText(routineNameInput, '수정된 루틴');
        });

        await waitFor(
          () => {
            const editButton = getByText('수정');

            expect(editButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const editButton = getByText('수정');

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
        const { getByPlaceholderText, getByText } = render(
          <RoutineFormModal />,
        );

        // 루틴 이름 수정
        const routineNameInput =
          getByPlaceholderText('루틴 이름을 입력하세요.');

        await act(async () => {
          fireEvent.changeText(routineNameInput, '수정된 루틴');
        });

        await waitFor(
          () => {
            const editButton = getByText('수정');

            expect(editButton).toBeEnabled();
          },
          { timeout: 3000 },
        );

        const editButton = getByText('수정');

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
    it('취소 버튼이 화면에 표시된다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const cancelButton = getByText('취소');

      expect(cancelButton).toBeOnTheScreen();
    });

    it('취소 버튼 클릭 시 이전 페이지(루틴 상세)로 이동한다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const cancelButton = getByText('취소');

      await act(async () => {
        fireEvent.press(cancelButton);
      });

      expect(mockBack).toHaveBeenCalled();
    });
  });
});
