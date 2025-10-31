import { QuestTypeFilter } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as questApi from '../api/quest.api';
import * as rewardApi from '../api/reward.api';
import { questKeys, rewardKeys } from '../types/query-keys/quest';

// 목록 조회
export const useFetchQuestsQuery = (filter: QuestTypeFilter = 'ALL') => {
  return useQuery({
    queryKey: questKeys.list(filter),
    queryFn: () => questApi.fetchQuests(filter),
    initialData: [],
  });
};

// 상세 조회
export const useFetchQuestDetailQuery = (id: string) => {
  return useQuery({
    queryKey: questKeys.detail(id),
    queryFn: () => questApi.fetchQuestDetail(id),
    enabled: !!id,
  });
};

// 생성
export const useCreateQuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.createQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questKeys.lists() });
    },
  });
};

// 수정
export const useUpdateQuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.updateQuest,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: questKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: questKeys.detail(variables.id),
      });
    },
  });
};

// 삭제
export const useDeleteQuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.deleteQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questKeys.lists() });
    },
  });
};

// 보상 목록 조회
export const useFetchRewardsQuery = () => {
  return useQuery({
    queryKey: rewardKeys.lists(),
    queryFn: rewardApi.fetchRewards,
    initialData: [],
  });
};
