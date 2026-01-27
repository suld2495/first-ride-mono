import { QuestTypeFilter, RewardTypeFilter } from '@repo/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as questApi from '../api/quest.api';
import * as rewardApi from '../api/reward.api';
import { questKeys, rewardKeys } from '../types/query-keys/quest';

// 목록 조회
export const useFetchQuestsQuery = (filter: QuestTypeFilter = 'ALL') => {
  return useQuery({
    queryKey: questKeys.list(filter),
    queryFn: () => questApi.fetchQuests(filter),
  });
};

// 상세 조회
export const useFetchQuestDetailQuery = (id: number) => {
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

// 수락
export const useAccpetQuestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: questApi.acceptQuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questKeys.lists() });
    },
  });
};

// 보상 목록 조회 (필터 포함)
export const useFetchRewardsQuery = (filter: RewardTypeFilter = 'ALL') => {
  return useQuery({
    queryKey: rewardKeys.list(filter),
    queryFn: () => rewardApi.fetchRewards(filter),
  });
};

// 보상 상세 조회
export const useFetchRewardDetailQuery = (rewardId: number) => {
  return useQuery({
    queryKey: rewardKeys.detail(rewardId),
    queryFn: () => rewardApi.fetchRewardDetail(rewardId),
    enabled: !!rewardId,
  });
};

// 보상 생성
export const useCreateRewardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.createReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
    },
  });
};

// 보상 수정
export const useUpdateRewardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.updateReward,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: rewardKeys.detail(variables.rewardId),
      });
    },
  });
};

// 보상 삭제
export const useDeleteRewardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rewardApi.deleteReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
    },
  });
};
