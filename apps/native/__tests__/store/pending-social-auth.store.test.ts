import { usePendingAppleAuthStore } from '@/store/pending-apple-auth.store';

describe('pending social auth store', () => {
  beforeEach(() => {
    usePendingAppleAuthStore.getState().clearAttempt();
  });

  it('provider와 만료 시각을 credential에 결합해 한 인증 시도로 보관한다', () => {
    const attemptId = usePendingAppleAuthStore.getState().beginAttempt({
      provider: 'kakao',
      socialId: '12345',
      accessToken: 'kakao-access-token',
      expiresAt: 2_000,
    });

    expect(usePendingAppleAuthStore.getState().attempt).toEqual({
      id: attemptId,
      provider: 'kakao',
      expiresAt: 2_000,
      credential: {
        provider: 'kakao',
        socialId: '12345',
        accessToken: 'kakao-access-token',
        expiresAt: 2_000,
      },
    });
  });

  it('만료된 인증 시도는 반환하지 않고 즉시 삭제한다', () => {
    usePendingAppleAuthStore.getState().beginAttempt({
      provider: 'kakao',
      socialId: '12345',
      accessToken: 'kakao-access-token',
      expiresAt: 1_000,
    });

    expect(
      usePendingAppleAuthStore.getState().getValidAttempt(1_001),
    ).toBeNull();
    expect(usePendingAppleAuthStore.getState().attempt).toBeNull();
  });

  it('만료 시각이 되면 화면 동작 없이도 인증 시도를 자동 삭제한다', () => {
    jest.useFakeTimers();
    jest.setSystemTime(1_000);

    try {
      usePendingAppleAuthStore.getState().beginAttempt({
        provider: 'kakao',
        socialId: '12345',
        accessToken: 'kakao-access-token',
        expiresAt: 1_500,
      });

      jest.advanceTimersByTime(500);

      expect(usePendingAppleAuthStore.getState().attempt).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('이전 인증 시도의 정리 요청이 새 인증 시도를 삭제하지 않는다', () => {
    const firstAttemptId = usePendingAppleAuthStore.getState().beginAttempt({
      provider: 'kakao',
      socialId: '12345',
      accessToken: 'first-token',
      expiresAt: 2_000,
    });
    const secondAttemptId = usePendingAppleAuthStore.getState().beginAttempt({
      provider: 'kakao',
      socialId: '67890',
      accessToken: 'second-token',
      expiresAt: 3_000,
    });

    usePendingAppleAuthStore.getState().clearAttempt(firstAttemptId);

    expect(usePendingAppleAuthStore.getState().attempt?.id).toBe(
      secondAttemptId,
    );
  });
});
