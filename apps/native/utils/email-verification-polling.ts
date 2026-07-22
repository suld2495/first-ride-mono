import { HttpError } from '@repo/shared/api/AppError';
import axios, { AxiosHeaders } from 'axios';

const BASE_POLL_DELAY_MS = 2500;
const MAX_POLL_DELAY_MS = 30_000;
const JITTER_RATIO = 0.2;

export const getEmailVerificationBackoffDelay = (
  consecutiveFailures: number,
  randomValue: number = Math.random(),
): number => {
  const normalizedFailures = Math.min(
    Math.max(Math.floor(consecutiveFailures), 0),
    10,
  );
  const exponentialDelay = Math.min(
    BASE_POLL_DELAY_MS * 2 ** normalizedFailures,
    MAX_POLL_DELAY_MS,
  );
  const normalizedRandom = Math.min(Math.max(randomValue, 0), 1);
  const jitterMultiplier = 1 + (normalizedRandom - 0.5) * JITTER_RATIO * 2;

  return Math.min(
    Math.round(exponentialDelay * jitterMultiplier),
    MAX_POLL_DELAY_MS,
  );
};

const getRetryAfterHeader = (error: unknown): string | null => {
  if (!(error instanceof HttpError) || error.status !== 429) {
    return null;
  }

  if (!axios.isAxiosError(error.originalError)) {
    return null;
  }

  const headers = error.originalError.response?.headers;
  const headerValue =
    headers instanceof AxiosHeaders
      ? headers.get('Retry-After')
      : (headers?.['retry-after'] ?? headers?.['Retry-After']);

  if (typeof headerValue === 'number') {
    return String(headerValue);
  }

  return typeof headerValue === 'string' ? headerValue : null;
};

export const getRetryAfterDelay = (
  error: unknown,
  now: number = Date.now(),
): number | null => {
  const retryAfter = getRetryAfterHeader(error)?.trim();

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const retryAt = Date.parse(retryAfter);

  return Number.isFinite(retryAt) ? Math.max(0, retryAt - now) : null;
};
