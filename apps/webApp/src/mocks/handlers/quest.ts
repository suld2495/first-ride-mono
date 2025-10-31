import { Quest, QuestForm, QuestTypeFilter, Reward } from '@repo/types';
import { http, HttpResponse } from 'msw';

const BASE_URL = import.meta.env.VITE_MOCK_BASE_URL;

const mockQuests: Quest[] = [
  {
    id: '1',
    questName: '일일 루틴 3회 완료',
    questType: 'DAILY',
    description: '하루에 루틴을 3회 완료하세요',
    rewardId: 1,
    rewardName: '골드 100',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    requiredLevel: 1,
    maxParticipants: 100,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    questName: '주간 루틴 마스터',
    questType: 'WEEKLY',
    description: '일주일 동안 루틴을 완벽하게 수행하세요',
    rewardId: 2,
    rewardName: '젬 50',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    requiredLevel: 5,
    maxParticipants: 50,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    questName: '일일 운동 챌린지',
    questType: 'DAILY',
    description: '매일 30분 이상 운동하세요',
    rewardId: 3,
    rewardName: '경험치 200',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    requiredLevel: 3,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockRewards: Reward[] = [
  {
    id: 1,
    rewardName: '골드 100',
    rewardType: 'GOLD',
    rewardAmount: 100,
    description: '골드 100개를 획득합니다',
  },
  {
    id: 2,
    rewardName: '젬 50',
    rewardType: 'GEM',
    rewardAmount: 50,
    description: '젬 50개를 획득합니다',
  },
  {
    id: 3,
    rewardName: '경험치 200',
    rewardType: 'EXP',
    rewardAmount: 200,
    description: '경험치 200을 획득합니다',
  },
  {
    id: 4,
    rewardName: '특별 아이템',
    rewardType: 'ITEM',
    description: '특별한 아이템을 획득합니다',
  },
];

export const questHandlers = [
  // 퀘스트 목록 조회 (필터 포함)
  http.get(`${BASE_URL}/api/quest/list`, ({ request }) => {
    const searchParams = new URLSearchParams(request.url.split('?')[1]);
    const filter = (searchParams.get('filter') || 'ALL') as QuestTypeFilter;

    if (filter === 'ALL') {
      return HttpResponse.json(mockQuests);
    }

    const filteredQuests = mockQuests.filter(
      quest => quest.questType === filter,
    );
    return HttpResponse.json(filteredQuests);
  }),

  // 퀘스트 상세 조회
  http.get(`${BASE_URL}/api/quest/:id`, ({ params }) => {
    const { id } = params;

    const quest = mockQuests.find(q => q.id === id);

    if (!quest) {
      return HttpResponse.json(
        { message: '퀘스트를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    return HttpResponse.json(quest);
  }),

  // 퀘스트 생성
  http.post(`${BASE_URL}/api/quest`, async ({ request }) => {
    const body = (await request.json()) as QuestForm;

    if (
      !body.questName ||
      !body.questType ||
      !body.description ||
      !body.rewardId ||
      !body.startDate ||
      !body.endDate ||
      body.requiredLevel === undefined
    ) {
      return HttpResponse.json(
        { message: '필수 필드를 입력해주세요.' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { message: '퀘스트가 생성되었습니다.' },
      { status: 201 },
    );
  }),

  // 퀘스트 수정
  http.put(`${BASE_URL}/api/quest/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as QuestForm;

    if (
      !body.questName ||
      !body.questType ||
      !body.description ||
      !body.rewardId ||
      !body.startDate ||
      !body.endDate ||
      body.requiredLevel === undefined
    ) {
      return HttpResponse.json(
        { message: '필수 필드를 입력해주세요.' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { message: '퀘스트가 수정되었습니다.' },
      { status: 200 },
    );
  }),

  // 퀘스트 삭제
  http.delete(`${BASE_URL}/api/quest/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json(
      { message: '퀘스트가 삭제되었습니다.' },
      { status: 200 },
    );
  }),

  // 보상 목록 조회
  http.get(`${BASE_URL}/api/quest/reward/list`, () => {
    return HttpResponse.json(mockRewards);
  }),
];
