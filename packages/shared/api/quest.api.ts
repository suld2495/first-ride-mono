import type {
  CreateQuestForm,
  Quest,
  QuestStatusFilter,
  QuestTypeFilter,
  UpdateQuestForm,
} from '@repo/types';

import { toAppError } from '.';
import http from './client';

export interface FetchQuestsParams {
  status?: QuestStatusFilter;
  questType?: QuestTypeFilter;
}

// 목록 조회
export const fetchQuests = async (
  params: FetchQuestsParams = {},
): Promise<Quest[]> => {
  try {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'ALL') {
      searchParams.append('status', params.status);
    }
    if (params.questType && params.questType !== 'ALL') {
      searchParams.append('questType', params.questType);
    }
    const query = searchParams.toString();
    const response: Quest[] = await http.get(
      `/quest/list${query ? `?${query}` : ''}`,
    );

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

// 상세 조회
export const fetchQuestDetail = async (id: number): Promise<Quest> => {
  try {
    const response: Quest = await http.get(`/quest/${id}`);

    return response;
  } catch (error) {
    throw toAppError(error);
  }
};

// 생성
export const createQuest = async (form: CreateQuestForm): Promise<void> => {
  try {
    await http.post('/quest', form);
  } catch (error) {
    throw toAppError(error);
  }
};

// 수정
export const updateQuest = async ({
  id,
  ...form
}: UpdateQuestForm): Promise<void> => {
  try {
    await http.put(`/quest/${id}`, form);
  } catch (error) {
    throw toAppError(error);
  }
};

// 삭제
export const deleteQuest = async (id: number): Promise<void> => {
  try {
    await http.delete(`/quest/${id}`);
  } catch (error) {
    throw toAppError(error);
  }
};

// 수락
export const acceptQuest = async (questId: number): Promise<void> => {
  try {
    await http.post(`/quest/accept`, {
      questId,
    });
  } catch (error) {
    throw toAppError(error);
  }
};

// 완료
export const completeQuest = async (questId: number): Promise<void> => {
  try {
    await http.post('/quest/complete', {
      questId,
    });
  } catch (error) {
    throw toAppError(error);
  }
};

// 출석 체크
export const recordVisit = async (): Promise<void> => {
  try {
    await http.post('/quest/visit');
  } catch {
    // 출석 체크 실패는 사용자 경험에 영향 없음
  }
};
