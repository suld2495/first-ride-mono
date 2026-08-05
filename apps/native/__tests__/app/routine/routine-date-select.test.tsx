import { getFormatDate } from '@repo/shared/utils';
import { fireEvent } from '@testing-library/react-native';

import RoutineDateSelectPage from '../../../app/routine-date-select';
import { render, resetAuthMocks } from '../../setup/auth-test-utils';

declare const mockBack: jest.Mock;
declare const mockRoutineStore: {
  routineDateSelection: null | {
    initialStartDate: string | null;
    initialEndDate: string | null;
    confirmedStartDate: string | null;
    confirmedEndDate: string | null;
    isStartDateFixed?: boolean;
  };
  beginRoutineDateSelection: jest.Mock;
  confirmRoutineDateSelection: jest.Mock;
  clearRoutineDateSelection: jest.Mock;
};

const getStartOfToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  return today;
};

describe('RoutineDateSelectPage', () => {
  beforeEach(() => {
    resetAuthMocks();
    const today = getStartOfToday();

    mockRoutineStore.routineDateSelection = {
      initialStartDate: getFormatDate(today),
      initialEndDate: null,
      confirmedStartDate: null,
      confirmedEndDate: null,
    };
    mockRoutineStore.confirmRoutineDateSelection.mockClear();
    mockRoutineStore.clearRoutineDateSelection.mockClear();
  });

  it('전체 페이지에서 날짜를 선택하고 확인하면 선택 결과를 전달한다', () => {
    const today = getStartOfToday();
    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    const { getByLabelText, getByText, queryByLabelText } = render(
      <RoutineDateSelectPage />,
    );

    expect(getByText('날짜 선택')).toBeOnTheScreen();
    expect(queryByLabelText('날짜 선택 바텀 시트')).not.toBeOnTheScreen();

    fireEvent.press(getByLabelText(`${getFormatDate(tomorrow)} 선택 가능`));
    fireEvent.press(getByText('선택완료'));

    expect(mockRoutineStore.confirmRoutineDateSelection).toHaveBeenCalledWith(
      getFormatDate(today),
      getFormatDate(tomorrow),
    );
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('과거에 시작한 루틴 수정은 시작일을 고정하고 선택한 날짜만 종료일로 전달한다', () => {
    const today = getStartOfToday();
    const pastStartDate = new Date(today);

    pastStartDate.setDate(today.getDate() - 1);
    mockRoutineStore.routineDateSelection = {
      initialStartDate: getFormatDate(pastStartDate),
      initialEndDate: getFormatDate(today),
      confirmedStartDate: null,
      confirmedEndDate: null,
      isStartDateFixed: true,
    };

    const { getByLabelText, getByText } = render(<RoutineDateSelectPage />);

    fireEvent.press(getByLabelText(`${getFormatDate(today)} 선택 가능`));
    fireEvent.press(getByText('선택완료'));

    expect(mockRoutineStore.confirmRoutineDateSelection).toHaveBeenCalledWith(
      getFormatDate(pastStartDate),
      getFormatDate(today),
    );
  });

  it('취소하면 선택 상태를 비우고 이전 페이지로 돌아간다', () => {
    const { getByLabelText } = render(<RoutineDateSelectPage />);

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockRoutineStore.clearRoutineDateSelection).toHaveBeenCalledTimes(1);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
