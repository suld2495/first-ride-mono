import { render } from '@testing-library/react-native';

import RoutineHeader from '@/components/routine/routine-header';

const mockUseReceivedRequests = jest.fn();

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

  it('인증 요청과 루틴 수정 요청을 합한 알림 수를 벨에 표시한다', () => {
    const { getByLabelText } = render(<RoutineHeader date="2026-07-19" />);

    expect(getByLabelText('인증 요청 알림 3건')).toBeOnTheScreen();
  });
});
