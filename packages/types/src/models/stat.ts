export type StatKey =
  | 'STRENGTH'
  | 'AGILITY'
  | 'INTELLIGENCE'
  | 'LUCK'
  | 'VITALITY'
  | 'MANA';

export interface UserStats {
  strength: number;
  agility: number;
  intelligence: number;
  luck: number;
  vitality: number;
  mana: number;
}

export interface StatResponse {
  userId: number;
  nickname: string;
  currentLevel: number;
  currentTotalExp: number;
  currentLevelProgress: number;
  expForNextLevel: number;
  stats: UserStats;
  availablePoints: number;
  totalPointsEarned: number;
  totalPointsUsed: number;
}
