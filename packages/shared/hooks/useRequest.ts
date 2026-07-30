import type { CreateRequestResponseDto } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as requestApi from '../api/request.api';
import type { CreateRequestOptions } from '../api/request.api';
import { requestKey } from '../types/query-keys/request';

interface CreateRequestMutationVariables extends CreateRequestOptions {
  data: FormData;
}

export const useFetchReceivedRequestsQuery = (nickname: string) => {
  return useQuery({
    queryKey: requestKey.receivedList(nickname),
    queryFn: () => requestApi.fetchReceivedRequests(),
    initialData: [],
    enabled: !!nickname,
  });
};

export const useFetchRequestDetailQuery = (requestId: number) => {
  return useQuery({
    queryKey: requestKey.detail(requestId),
    queryFn: () => requestApi.fetchRequestDetail(requestId),
    enabled: !!requestId,
  });
};

export const useCreateRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, onUploadProgress }: CreateRequestMutationVariables) =>
      requestApi.createRequest(data, { onUploadProgress }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: requestKey.all(),
      });
    },
  });
};

export const useReplyRequestMutation = (user: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRequestResponseDto) =>
      requestApi.replyRequest(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: requestKey.receivedList(user),
      });
    },
  });
};
