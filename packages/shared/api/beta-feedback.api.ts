import http from './client';

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
  form: CreateBetaFeedbackRequest,
): Promise<BetaFeedback> =>
  http.post<BetaFeedback, CreateBetaFeedbackRequest>('/beta/feedback', form);
