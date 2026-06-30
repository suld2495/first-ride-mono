import {
  getAuthStackInitialRouteName,
  getAuthStackKey,
} from '@/utils/auth-stack-route';

describe('getAuthStackInitialRouteName', () => {
  it('로그인 상태에 맞는 루트 Stack 초기 라우트를 반환한다', () => {
    expect(getAuthStackInitialRouteName(true)).toBe('(tabs)');
    expect(getAuthStackInitialRouteName(false)).toBe('sign-in');
  });

  it('인증 상태별로 루트 Stack remount key를 반환한다', () => {
    expect(getAuthStackKey(true)).toBe('auth-stack-signed-in');
    expect(getAuthStackKey(false)).toBe('auth-stack-signed-out');
  });
});
