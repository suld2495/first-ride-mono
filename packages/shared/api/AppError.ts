import { ErrorAraryData, FieldErrorReason } from '@repo/types';

export abstract class AppError extends Error {
  constructor(
    readonly originalError: unknown,
    message?: string,
  ) {
    super(message);
  }
}

export class UnknownError extends AppError {
  constructor(
    cause: unknown,
    message: string = '알 수 없는 오류가 발생했습니다.',
  ) {
    super(cause, message);
  }
}

export class NetworkError extends AppError {
  constructor(
    cause: unknown,
    message: string = '네트워크 연결을 확인해 주세요.',
  ) {
    super(cause, message);
  }
}

export class TimeoutError extends AppError {
  constructor(cause: unknown, message: string = '요청이 시간 초과되었습니다.') {
    super(cause, message);
  }
}

export class HttpError extends AppError {
  constructor(
    readonly status: number,
    readonly url: string = '',
    cause: unknown,
    message: string = '',
  ) {
    super(cause, message);
  }
}

export class ApiError extends HttpError {
  constructor(
    private details: FieldErrorReason[] | ErrorAraryData,
    status: number,
    url: string = '',
    cause: unknown,
    message: string = '',
  ) {
    super(status, url, cause, message);
  }

  get detail() {
    return this.details;
  }
}
