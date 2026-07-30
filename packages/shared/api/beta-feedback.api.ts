import http from './client';

export interface CreateBetaFeedbackRequest {
  content: string;
  images?: BetaFeedbackImageUpload[];
}

export interface BetaFeedbackImageUpload {
  uri: string;
  name: string;
  type: string;
  size: number;
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
): Promise<BetaFeedback> => {
  if (!form.images?.length) {
    return http.post<BetaFeedback, Pick<CreateBetaFeedbackRequest, 'content'>>(
      '/beta/feedback',
      { content: form.content },
    );
  }

  const multipartBody = new FormData();

  multipartBody.append('content', form.content);

  for (const image of form.images) {
    multipartBody.append('images', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  }

  return http.post<BetaFeedback, FormData>('/beta/feedback', multipartBody);
};
