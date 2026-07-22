import { HttpError } from '@repo/shared/api/AppError';

import {
  getEmailVerificationBackoffDelay,
  getRetryAfterDelay,
} from '@/utils/email-verification-polling';

const createRateLimitError = (retryAfter: string): HttpError =>
  new HttpError(
    429,
    '/auth/email/verification-confirm',
    {
      isAxiosError: true,
      response: {
        status: 429,
        headers: { 'retry-after': retryAfter },
      },
    },
    'too many requests',
  );

describe('이메일 인증 폴링 지연 계산', () => {
  it.each([
    [0, 2500],
    [1, 5000],
    [2, 10_000],
    [3, 20_000],
    [10, 30_000],
  ])(
    '실패 횟수 %i에서 중앙 jitter 지연을 %ims로 계산한다',
    (failures, expected) => {
      expect(getEmailVerificationBackoffDelay(failures, 0.5)).toBe(expected);
    },
  );

  it('jitter를 적용하면서 최대 지연을 30초로 제한한다', () => {
    expect(getEmailVerificationBackoffDelay(1, 0)).toBe(4000);
    expect(getEmailVerificationBackoffDelay(1, 1)).toBe(6000);
    expect(getEmailVerificationBackoffDelay(10, 1)).toBe(30_000);
  });

  it('Retry-After 초 값을 밀리초로 변환한다', () => {
    expect(getRetryAfterDelay(createRateLimitError('12'), 0)).toBe(12_000);
  });

  it('Retry-After HTTP 날짜를 현재 시각 기준 지연으로 변환한다', () => {
    const now = Date.parse('2026-07-22T00:00:00.000Z');
    const retryAt = new Date(now + 15_000).toUTCString();

    expect(getRetryAfterDelay(createRateLimitError(retryAt), now)).toBe(15_000);
  });

  it('429가 아니거나 잘못된 Retry-After는 사용하지 않는다', () => {
    const serverError = new HttpError(500, '/test', {
      isAxiosError: true,
      response: { status: 500, headers: { 'retry-after': '12' } },
    });

    expect(getRetryAfterDelay(serverError, 0)).toBeNull();
    expect(getRetryAfterDelay(createRateLimitError('invalid'), 0)).toBeNull();
  });
});
