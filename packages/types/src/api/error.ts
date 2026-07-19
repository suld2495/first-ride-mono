export type ErrorAraryData = {
  errors: [];
};

export type FieldErrorReason = {
  field: string;
  message: string;
  rejected: string;
};

export type AuthErrorCode =
  | 'TOKEN_REQUIRED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_MALFORMED'
  | 'TOKEN_SIGNATURE_INVALID'
  | 'TOKEN_UNSUPPORTED'
  | 'TOKEN_INVALID';

export type ServerError = {
  error: {
    message: string;
    code?: AuthErrorCode;
    data?: FieldErrorReason[];
  };
  path: string;
  success: boolean;
  timestamp: string;
};

export type ErrorData = ErrorAraryData | ServerError;
