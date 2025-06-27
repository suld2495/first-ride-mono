import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as requestApi from '@/api/request.api';
import { requestKey } from '@/types/query-keys/request';

export const useFetchReceivedRequestsQuery = (nickname: string) => {
  return useQuery({
    queryKey: requestKey.receivedList(nickname),
    queryFn: () => requestApi.fetchReceivedRequests(nickname),
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
  return useMutation({
    mutationFn: (data: FormData) => requestApi.createRequest(data),
  });
};

export const useReplyRequestMutation = (user: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: requestApi.RoutineRequestCheckForm) =>
      requestApi.replyRequest(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requestKey.receivedList(user),
      });
    },
  });
};
