import NotFoundScreen from '../../app/+not-found';
import { render, resetAuthMocks } from '../setup/auth-test-utils';

declare const mockAuthStore: {
  user: { nickname: string; userId: string } | null;
};

describe('존재하지 않는 경로', () => {
  beforeEach(() => {
    resetAuthMocks();
  });

  it('로그인한 사용자는 루틴 페이지로 이동한다', () => {
    const { getByTestId } = render(<NotFoundScreen />);

    expect(getByTestId('redirect')).toHaveProp(
      'href',
      '/(tabs)/(afterLogin)/(routine)',
    );
  });

  it('로그아웃한 사용자는 로그인 페이지로 이동한다', () => {
    mockAuthStore.user = null;

    const { getByTestId } = render(<NotFoundScreen />);

    expect(getByTestId('redirect')).toHaveProp('href', '/sign-in');
  });
});
