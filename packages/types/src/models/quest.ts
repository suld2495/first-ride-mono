// Quest 엔티티
export interface Quest {
  id: string;
  questName: string;
  questType: 'DAILY' | 'WEEKLY';
  description: string;
  rewardId: number;
  rewardName?: string; // 조회 시 포함
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  requiredLevel: number;
  maxParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

// Reward 엔티티
export interface Reward {
  rewardId: number;
  rewardName: string;
  rewardType: 'BADGE' | 'EXP';
  expAmount: number;
  description?: string;
  createdAt: string; // ISO 8601
}

// 폼 타입
export type QuestForm = Omit<
  Quest,
  'id' | 'rewardName' | 'createdAt' | 'updatedAt'
>;

// 필터 타입
export type QuestTypeFilter = 'ALL' | 'DAILY' | 'WEEKLY';
