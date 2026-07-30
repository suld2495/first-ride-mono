import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBetaFeedback } from '../api/beta-feedback.api';

interface BetaFeedbackImageUpload {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface CreateBetaFeedbackForm {
  content: string;
  images?: BetaFeedbackImageUpload[];
}

const betaFeedbackKeys = {
  all: () => ['beta-feedback'] as const,
};

const createRequestBody = ({
  content,
  images,
}: CreateBetaFeedbackForm): { content: string } | FormData => {
  if (!images?.length) {
    return { content };
  }

  const formData = new FormData();

  for (const image of images) {
    formData.append('images', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  }
  formData.append('content', content);

  return formData;
};

export const useCreateBetaFeedbackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: CreateBetaFeedbackForm) =>
      createBetaFeedback(createRequestBody(form)),
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: betaFeedbackKeys.all(),
        });
      } catch {
        // 피드백 저장 결과는 캐시 무효화 실패로 되돌리지 않는다.
      }
    },
  });
};
