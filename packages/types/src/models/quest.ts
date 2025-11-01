// Quest 엔티티
type QuestStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
type QuestType = 'DAILY' | 'WEEKLY';
type RewardType = 'BADGE' | 'EXP';

export interface Quest {
  questId: number;
  questName: string;
  questType: QuestType;
  description: string;
  rewardId: number;
  rewardName: string;
  rewardType: RewardType;
  expAmount: number;
  startDate: string; // ISO 8601 형식
  endDate: string; // ISO 8601 형식
  requiredLevel: number;
  maxParticipants: number;
  currentParticipants: number;
  completedCount: number;
  myRank: number;
  status: QuestStatus;
  isAccepted: boolean;
  isCompleted: boolean;
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
  'questId' | 'rewardName' | 'createdAt' | 'updatedAt' | 'currentParticipants' | 'currentParticipants' | 'completedCount' | 'myRank' | 'status' | 'isAccepted' | 'isCompleted'
>;

// 필터 타입
export type QuestTypeFilter = 'ALL' | 'DAILY' | 'WEEKLY';
