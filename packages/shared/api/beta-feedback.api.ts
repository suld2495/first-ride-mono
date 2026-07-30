import http from './client';

const IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

export interface CreateBetaFeedbackRequest {
  content: string;
}

export interface BetaFeedback {
  feedbackId: number;
  userId: string;
  nickname: string;
  content: string;
  submittedAt: string;
}

export const createBetaFeedback = (
  data: CreateBetaFeedbackRequest | FormData,
): Promise<BetaFeedback> => {
  return http.post<BetaFeedback, CreateBetaFeedbackRequest | FormData>(
    '/beta/feedback',
    data,
    data instanceof FormData
      ? {
          timeout: IMAGE_UPLOAD_TIMEOUT_MS,
        }
      : undefined,
  );
};
