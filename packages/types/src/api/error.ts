export type ErrorAraryData = {
  errors: [];
};

export type FieldErrorReason = {
  field: string;
  message: string;
  rejected: string;
};

export type ServerError = {
  error: {
    message: string;
    data?: FieldErrorReason[];
  };
  path: string;
  success: boolean;
  timestamp: string;
};

export type ErrorData = ErrorAraryData | ServerError;
