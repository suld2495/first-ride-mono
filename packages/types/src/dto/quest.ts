import { Quest, QuestForm, Reward } from '../models/quest';

// 수정 요청 타입
export type UpdateQuestForm = QuestForm & {
  id: Quest['questId'];
};

// 목록 조회 응답 타입
export interface QuestListResponse {
  data: Quest[];
  total: number;
}

// 상세 조회 응답 타입
export interface QuestDetailResponse {
  data: Quest;
}

// Reward 폼 타입
export type RewardForm = Omit<Reward, 'rewardId' | 'createdAt'>;

// Reward 수정 요청 타입
export type UpdateRewardForm = RewardForm & {
  rewardId: Reward['rewardId'];
};

// Reward 필터 타입
export type RewardTypeFilter = 'ALL' | 'BADGE' | 'EXP';
