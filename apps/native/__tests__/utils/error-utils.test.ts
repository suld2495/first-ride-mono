import { ApiError } from '@repo/shared/api/AppError';

import {
  getApiErrorMessage,
  getApiErrorMessageWithCode,
  getDetailedApiErrorMessage,
  getFieldErrors,
} from '@/utils/error-utils';

const createApiError = ({
  code,
  details = [],
  message = '서버 오류가 발생했습니다.',
}: {
  code?: string;
  details?: { field: string; message: string; rejected: string }[];
  message?: string;
} = {}) => new ApiError(details, 400, '/test', undefined, message, code);

describe('error-utils', () => {
  it('API 오류 메시지를 반환한다', () => {
    expect(getApiErrorMessage(createApiError(), '기본 메시지')).toBe(
      '서버 오류가 발생했습니다.',
    );
  });

  it('API 오류가 아니면 기본 메시지를 반환한다', () => {
    expect(getApiErrorMessage(new Error('client error'), '기본 메시지')).toBe(
      '기본 메시지',
    );
  });

  it('서버 오류 코드와 메시지를 함께 반환한다', () => {
    expect(
      getApiErrorMessageWithCode(
        createApiError({ code: 'IMAGE_UPLOAD_FAILED' }),
        '기본 메시지',
      ),
    ).toBe('[IMAGE_UPLOAD_FAILED] 서버 오류가 발생했습니다.');
  });

  it('서버 오류 코드가 없으면 메시지만 반환한다', () => {
    expect(getApiErrorMessageWithCode(createApiError(), '기본 메시지')).toBe(
      '서버 오류가 발생했습니다.',
    );
  });

  it('API 오류 메시지가 비어 있으면 기본 메시지를 반환한다', () => {
    expect(
      getApiErrorMessageWithCode(
        createApiError({ code: 'EMPTY_MESSAGE', message: '' }),
        '기본 메시지',
      ),
    ).toBe('[EMPTY_MESSAGE] 기본 메시지');
  });

  it('필드 상세 메시지와 필드별 오류를 추출한다', () => {
    const error = createApiError({
      details: [
        {
          field: 'images',
          message: '이미지를 처리할 수 없습니다.',
          rejected: 'feedback.jpg',
        },
      ],
    });

    expect(getDetailedApiErrorMessage(error, '기본 메시지')).toBe(
      '이미지를 처리할 수 없습니다.',
    );
    expect(getFieldErrors(error)).toEqual({
      images: '이미지를 처리할 수 없습니다.',
    });
  });

  it('상세 정보가 없으면 API 메시지와 빈 필드 오류를 반환한다', () => {
    const error = createApiError();

    expect(getDetailedApiErrorMessage(error, '기본 메시지')).toBe(
      '서버 오류가 발생했습니다.',
    );
    expect(getFieldErrors(new Error('client error'))).toEqual({});
  });
});
