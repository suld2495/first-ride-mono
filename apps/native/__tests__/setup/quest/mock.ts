import type { Quest } from '@repo/types';

// ========================================
// Quest Mock Factory
// ========================================

export interface CreateMockQuestOptions {
  questType?: Quest['questType'];
  status?: Quest['status'];
  isAccepted?: boolean;
  isCompleted?: boolean;
  requiredLevel?: number;
  maxParticipants?: number;
  currentParticipants?: number;
}

export const createMockQuest = (
  index: number = 0,
  options: CreateMockQuestOptions = {},
): Quest => ({
  questId: index + 1,
  questName: `테스트 퀘스트 ${index + 1}`,
  questType: options.questType ?? 'DAILY',
  description: `테스트 퀘스트 ${index + 1} 설명`,
  rewardId: index + 1,
  rewardName: `리워드 ${index + 1}`,
  rewardType: 'EXP',
  expAmount: 100,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  requiredLevel: options.requiredLevel ?? 1,
  maxParticipants: options.maxParticipants ?? 100,
  currentParticipants: options.currentParticipants ?? 10,
  completedCount: 0,
  myRank: 0,
  status: options.status ?? 'ACTIVE',
  isAccepted: options.isAccepted ?? false,
  isCompleted: options.isCompleted ?? false,
});

export const createMockQuests = (
  count: number,
  options: CreateMockQuestOptions = {},
): Quest[] =>
  Array.from({ length: count }, (_, index) => createMockQuest(index, options));
