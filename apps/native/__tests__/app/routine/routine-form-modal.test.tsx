import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import RoutineFormModal from '../../../components/modal/RoutineFormModal';
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

// DateTimePicker mock
let mockDateTimePickerOnChange: ((event: unknown, date?: Date) => void) | null =
  null;

jest.mock('@react-native-community/datetimepicker', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');

  return {
    __esModule: true,
    default: ({
      onChange,
    }: {
      onChange: (event: unknown, date?: Date) => void;
    }) => {
      mockDateTimePickerOnChange = onChange;

      return React.createElement('RNDateTimePicker', { testID: 'date-picker' });
    },
  };
});

// BouncyCheckbox mock - global 변수 사용
(global as any).mockCheckboxChecked = false;

jest.mock('react-native-bouncy-checkbox', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    mockDateTimePickerOnChange = null;
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
    data: {
      routineName?: string;
      routineDetail?: string;
      penalty?: string;
      routineCount?: string;
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
        fireEvent.changeText(
          getByPlaceholderText('루틴 횟수를 입력해주세요.'),
          data.routineCount,
        );
      });
    }
  };

  // 날짜 선택 헬퍼 함수
  const selectStartDate = async (getAllByText: (text: string) => any[]) => {
    const dateButtons = getAllByText('날짜 선택');

    // 첫 번째 버튼이 시작 날짜
    await act(async () => {
      fireEvent.press(dateButtons[0]);
    });

    // DateTimePicker가 마운트된 후 날짜 선택
    await act(async () => {
      if (mockDateTimePickerOnChange) {
        mockDateTimePickerOnChange({}, new Date('2025-01-06'));
      }
    });
  };

  // 모든 필수 필드 입력 헬퍼 함수
  // isMe가 이미 true로 설정되어 있으므로 체크박스 클릭 불필요
  const fillAllRequiredFields = async (
    getByPlaceholderText: (text: string) => any,
    getAllByText: (text: string) => any[],
  ) => {
    // API 호출이 완료될 때까지 대기
    await waitFor(() => {
      expect(mockAxios.history.get.length).toBeGreaterThan(0);
    });

    await fillForm(getByPlaceholderText, {
      routineName: '테스트 루틴',
      routineDetail: '테스트 설명',
      penalty: '1000',
      routineCount: '3',
    });

    // 시작 날짜 선택
    await selectStartDate(getAllByText);
  };

  describe('필수값 입력 전 추가 버튼 비활성화 테스트', () => {
    it('모든 필드가 비어있을 때 추가 버튼이 비활성화되어 있다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const addButton = getByText('추가');

      expect(addButton).toBeDisabled();
    });

    it('모든 필수값 입력 + 직접 루틴 체크 시 추가 버튼이 활성화된다', async () => {
      const { getByPlaceholderText, getByText, getAllByText } = render(
        <RoutineFormModal />,
      );

      await fillAllRequiredFields(getByPlaceholderText, getAllByText);

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
    it('루틴 횟수가 1 미만이면 입력되지 않는다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '0');
      });

      // 0은 1-7 범위를 벗어나므로 입력되지 않음 (초기값 '' 유지)
      expect(routineCountInput.props.value).toBe('');
    });

    it('루틴 횟수가 7 초과이면 입력되지 않는다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '8');
      });

      // 8은 1-7 범위를 벗어나므로 입력되지 않음 (초기값 '' 유지)
      expect(routineCountInput.props.value).toBe('');
    });

    it('루틴 횟수 1-7 사이 값은 정상 입력된다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '5');
      });

      expect(routineCountInput.props.value).toBe('5');
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
        const { getByPlaceholderText, getByText, getAllByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(getByPlaceholderText, getAllByText);

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
        const { getByPlaceholderText, getByText, getAllByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(getByPlaceholderText, getAllByText);

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
        const { getByPlaceholderText, getByText, getAllByText } = render(
          <RoutineFormModal />,
        );

        await fillAllRequiredFields(getByPlaceholderText, getAllByText);

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
    it('취소 버튼이 화면에 표시된다', async () => {
      const { getByText } = render(<RoutineFormModal />);

      const cancelButton = getByText('취소');

      expect(cancelButton).toBeOnTheScreen();
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
    mockDateTimePickerOnChange = null;
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
      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      expect(routineCountInput.props.value).toBe('3');

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
      const { getByPlaceholderText, getByText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '');
      });

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
    it('루틴 횟수가 1 미만이면 입력되지 않는다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '0');
      });

      // 0은 1-7 범위를 벗어나므로 기존 값 유지
      expect(routineCountInput.props.value).toBe('3');
    });

    it('루틴 횟수가 7 초과이면 입력되지 않는다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '8');
      });

      // 8은 1-7 범위를 벗어나므로 기존 값 유지
      expect(routineCountInput.props.value).toBe('3');
    });

    it('루틴 횟수 1-7 사이 값은 정상 변경된다', async () => {
      const { getByPlaceholderText } = render(<RoutineFormModal />);

      const routineCountInput =
        getByPlaceholderText('루틴 횟수를 입력해주세요.');

      await act(async () => {
        fireEvent.changeText(routineCountInput, '5');
      });

      expect(routineCountInput.props.value).toBe('5');
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
          expect(global.alert).toHaveBeenCalledWith('루틴이 수정되었습니다.');
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
          expect(global.alert).toHaveBeenCalledWith(
            '루틴 수정에 실패했습니다.',
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
          expect(global.alert).toHaveBeenCalledWith(
            '루틴 수정에 실패했습니다.',
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
