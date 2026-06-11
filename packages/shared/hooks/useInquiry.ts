import { useMutation, useQueryClient } from '@tanstack/react-query';

import * as inquiryApi from '../api/inquiry.api';

const inquiryKeys = {
  all: () => ['inquiry'] as const,
};

export const useCreateInquiryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inquiryApi.createInquiry,
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: inquiryKeys.all() });
      } catch {
        // 문의 접수 결과는 캐시 무효화 실패로 되돌리지 않는다.
      }
    },
  });
};
