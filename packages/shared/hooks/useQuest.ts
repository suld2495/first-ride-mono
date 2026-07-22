import type { RewardTypeFilter, User } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as questApi from '../api/quest.api';
import type { FetchQuestsParams } from '../api/quest.api';
import * as rewardApi from '../api/reward.api';
import { questKeys, rewardKeys } from '../types/query-keys/quest';

// 목록 조회
export const useFetchQuestsQuery = (
  userId: User['userId'],
  params: FetchQuestsParams = {},
) => {
  return useQuery({
    queryKey: questKeys.list(userId, params),
    queryFn: () => questApi.fetchQuests(params),
    enabled: !!userId,
  });
};

// 상세 조회
export const useFetchQuestDetailQuery = (
  userId: User['userId'],
  id: number,
) => {
  return useQuery({
    queryKey: questKeys.detail(userId, id),
    queryFn: () => questApi.fetchQuestDetail(id),
    enabled: !!userId && !!id,
  });
};

// 생성
export const useCreateQuestMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.createQuest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: questKeys.lists(userId),
      });
    },
  });
};

// 수정
export const useUpdateQuestMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.updateQuest,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: questKeys.lists(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: questKeys.detail(userId, variables.id),
      });
    },
  });
};

// 삭제
export const useDeleteQuestMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.deleteQuest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: questKeys.lists(userId),
      });
    },
  });
};

// 수락
export const useAccpetQuestMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.acceptQuest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: questKeys.lists(userId),
      });
    },
  });
};

// 완료
export const useCompleteQuestMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.completeQuest,
    onSuccess: async (_, questId) => {
      await queryClient.invalidateQueries({
        queryKey: questKeys.lists(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: questKeys.detail(userId, questId),
      });
    },
  });
};

// 보상 목록 조회 (필터 포함)
export const useFetchRewardsQuery = (
  userId: User['userId'],
  filter: RewardTypeFilter = 'ALL',
) => {
  return useQuery({
    queryKey: rewardKeys.list(userId, filter),
    queryFn: () => rewardApi.fetchRewards(filter),
    enabled: !!userId,
  });
};

// 보상 상세 조회
export const useFetchRewardDetailQuery = (
  userId: User['userId'],
  rewardId: number,
) => {
  return useQuery({
    queryKey: rewardKeys.detail(userId, rewardId),
    queryFn: () => rewardApi.fetchRewardDetail(rewardId),
    enabled: !!userId && !!rewardId,
  });
};

// 보상 생성
export const useCreateRewardMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.createReward,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: rewardKeys.lists(userId),
      });
    },
  });
};

// 보상 수정
export const useUpdateRewardMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.updateReward,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: rewardKeys.lists(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: rewardKeys.detail(userId, variables.rewardId),
      });
    },
  });
};

// 보상 삭제
export const useDeleteRewardMutation = (userId: User['userId']) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.deleteReward,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: rewardKeys.lists(userId),
      });
    },
  });
};
