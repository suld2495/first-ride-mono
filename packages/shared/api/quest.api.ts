import {
  Quest,
  QuestForm,
  QuestTypeFilter,
  UpdateQuestForm,
} from '@repo/types';

import http from './client';
import { toAppError } from '.';

// 목록 조회 (필터 포함)
export const fetchQuests = async (
  filter: QuestTypeFilter = 'ALL',
): Promise<Quest[]> => {
  try {
    const response: Quest[] = await http.get(
      `/quest/list${filter !== 'ALL' ? `?filter=${filter}` : ''}`,
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
export const createQuest = async (form: QuestForm): Promise<void> => {
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
