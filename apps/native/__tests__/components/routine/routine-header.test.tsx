import { render } from '@testing-library/react-native';

import RoutineHeader from '@/components/routine/routine-header';

const mockUseReceivedRequests = jest.fn();
const mockIoniconsRender = jest.fn();

jest.mock('@expo/vector-icons/Ionicons', () => {
  return function MockIonicons(props: Record<string, unknown>) {
    mockIoniconsRender(props);

    return null;
  };
});

jest.mock('@/hooks/useAuthSession', () => ({
  useAuthUser: () => ({ nickname: 'tester' }),
}));

jest.mock('@/hooks/useReceivedRequests', () => ({
  useReceivedRequests: (nickname: string) => mockUseReceivedRequests(nickname),
}));

describe('RoutineHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseReceivedRequests.mockReturnValue({
      data: [],
      notificationCount: 3,
    });
  });

  it('서버의 대기 중 인증 요청 수를 벨에 표시한다', () => {
    const { getByLabelText } = render(<RoutineHeader date="2026-07-19" />);

    expect(getByLabelText('인증 요청 알림 3건')).toBeOnTheScreen();
  });

  it('날짜가 변경되어도 루틴 순서 변경 아이콘을 다시 렌더링하지 않는다', () => {
    const onPressReorder = jest.fn();
    const { rerender } = render(
      <RoutineHeader date="2026-07-19" onPressReorder={onPressReorder} />,
    );

    expect(mockIoniconsRender).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'swap-vertical' }),
    );
    mockIoniconsRender.mockClear();

    rerender(
      <RoutineHeader date="2026-07-26" onPressReorder={onPressReorder} />,
    );

    expect(mockIoniconsRender).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'swap-vertical' }),
    );
  });
});
