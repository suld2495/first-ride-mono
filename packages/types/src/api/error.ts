export type ErrorAraryData = {
  errors: [];
};

export type ErrorData =
  | ErrorAraryData
  | {
      message: string;
      error: string;
    };
