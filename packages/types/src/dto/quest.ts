import { Quest, QuestForm } from '../models/quest';

// 수정 요청 타입
export type UpdateQuestForm = QuestForm & {
  id: Quest['id'];
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
