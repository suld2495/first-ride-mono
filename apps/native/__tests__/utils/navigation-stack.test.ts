import {
  getNavigationAction,
  type NavigationLocation,
} from '../../utils/navigation-stack';

describe('getNavigationAction', () => {
  it('같은 모달 유형이면 동적 값이 달라도 replace를 사용한다', () => {
    const current: NavigationLocation = {
      pathname: '/modal',
      searchParams: { type: 'request-detail' },
    };

    expect(getNavigationAction(current, '/modal?type=request-detail')).toBe(
      'replace',
    );
  });

  it('같은 동적 페이지 유형이면 id가 달라도 replace를 사용한다', () => {
    const current: NavigationLocation = {
      pathname: '/verification-requests/1',
    };

    expect(getNavigationAction(current, '/verification-requests/2')).toBe(
      'replace',
    );
  });

  it('다른 페이지 유형이면 push를 사용한다', () => {
    const current: NavigationLocation = {
      pathname: '/modal',
      searchParams: { type: 'request-list' },
    };

    expect(getNavigationAction(current, '/modal?type=request-detail')).toBe(
      'push',
    );
  });

  it('다른 경로로 이동하면 push를 사용한다', () => {
    const current: NavigationLocation = {
      pathname: '/(tabs)/(afterLogin)/(routine)',
    };

    expect(getNavigationAction(current, '/modal?type=request-detail')).toBe(
      'push',
    );
  });
});
