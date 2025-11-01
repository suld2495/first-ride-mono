import {
  Reward,
  RewardForm,
  RewardTypeFilter,
  UpdateRewardForm,
} from '@repo/types';

import http from './client';
import { toAppError } from '.';

// 보상 목록 조회 (필터 포함)
export const fetchRewards = async (
  filter: RewardTypeFilter = 'ALL',
): Promise<Reward[]> => {
  try {
    const response: Reward[] = await http.get(
      `/quest/reward/list${filter !== 'ALL' ? `?filter=${filter}` : ''}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

// 보상 상세 조회
export const fetchRewardDetail = async (rewardId: number): Promise<Reward> => {
  try {
    const response: Reward = await http.get(`/quest/reward/${rewardId}`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

// 보상 생성
export const createReward = async (form: RewardForm): Promise<void> => {
  try {
    await http.post('/quest/reward', form);
  } catch (error) {
    throw toAppError(error);
  }
};

// 보상 수정
export const updateReward = async ({
  rewardId,
  ...form
}: UpdateRewardForm): Promise<void> => {
  try {
    await http.put(`/quest/reward/${rewardId}`, form);
  } catch (error) {
    throw toAppError(error);
  }
};

// 보상 삭제
export const deleteReward = async (rewardId: number): Promise<void> => {
  try {
    await http.delete(`/quest/reward/${rewardId}`);
  } catch (error) {
    throw toAppError(error);
  }
};
