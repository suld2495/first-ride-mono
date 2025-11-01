import { AuthResponse } from '@repo/types';
import { createServer } from 'miragejs';

export function makeServer() {
  return createServer({
    routes() {
      this.urlPrefix = process.env.EXPO_PUBLIC_VITE_BASE_URL || '';
      this.namespace = '/api';

      this.post<AuthResponse>('/auth/login', () => {
        return {
          accessToken: 'accessToken',
          userInfo: {
            userId: 'moon',
            nickname: '용사',
          },
        };
      });

      this.get('/routine/list', () => {
        return [
          {
            routineId: 2,
            nickname: 'yunji',
            routineName: '퇴근 후 공부 루틴',
            endDate: '2025-10-30',
            routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
            penalty: 5000,
            routineCount: 3,
            weeklyCount: 4,
            mateNickname: 'moon',
            successDate: ['250826', '250827', '250829', '250830'],
          },
        ];
      });

      this.get('/routine/details', () => {
        return {
          routineId: 1,
          nickname: 'yunji',
          routineName: '퇴근 후 공부 루틴',
          startDate: '2025-04-15',
          endDate: '2025-04-30',
          routineDetail: '일주일 3회 이상 퇴근 후 공부하고 인증사진 보내기',
          penalty: 5000,
          routineCount: 3,
          mateNickname: 'moon',
        };
      });

      // Quest APIs
      this.get('/quest/list', (schema, request) => {
        const filter = request.queryParams.filter || 'ALL';

        const mockQuests = [
          {
            questId: 1,
            questName: '일일 루틴 3회 완료',
            questType: 'DAILY',
            status: 'ACTIVE',
            description: '하루에 루틴을 3회 완료하세요',
            rewardId: 1,
            rewardName: '골드 100',
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            requiredLevel: 1,
            currentParticipants: 23,
            maxParticipants: 100,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          {
            questId: 2,
            questName: '주간 루틴 마스터',
            questType: 'WEEKLY',
            status: 'ACTIVE',
            description: '일주일 동안 루틴을 완벽하게 수행하세요',
            rewardId: 2,
            rewardName: '젬 50',
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            requiredLevel: 5,
            currentParticipants: 50,
            maxParticipants: 50,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          {
            questId: 3,
            questName: '일일 운동 챌린지',
            questType: 'DAILY',
            status: 'INACTIVE',
            description: '매일 30분 이상 운동하세요',
            rewardId: 3,
            rewardName: '경험치 200',
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            requiredLevel: 3,
            currentParticipants: 15,
            maxParticipants: 30,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          {
            questId: 4,
            questName: '주간 독서 챌린지',
            questType: 'WEEKLY',
            status: 'COMPLETED',
            description: '일주일 동안 책 3권 읽기',
            rewardId: 4,
            rewardName: '특별 칭호',
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-01-31T23:59:59Z',
            requiredLevel: 10,
            currentParticipants: 30,
            maxParticipants: 50,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
          {
            questId: 5,
            questName: '주간 명상 챌린지',
            questType: 'WEEKLY',
            status: 'INACTIVE',
            description: '매일 10분 명상하기',
            rewardId: 2,
            rewardName: '젬 30',
            startDate: '2025-01-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            requiredLevel: 1,
            currentParticipants: 8,
            maxParticipants: 20,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
          },
        ];

        if (filter === 'ALL') {
          return mockQuests;
        }

        return mockQuests.filter(quest => quest.questType === filter);
      });

      this.get('/quest/:id', (schema, request) => {
        const { id } = request.params;

        const mockQuest = {
          questId: Number(id),
          questName: '일일 루틴 3회 완료',
          questType: 'DAILY',
          status: 'ACTIVE',
          description: '하루에 루틴을 3회 완료하세요',
          rewardId: 1,
          rewardName: '골드 100',
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T23:59:59Z',
          requiredLevel: 1,
          currentParticipants: 23,
          maxParticipants: 100,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        };

        return mockQuest;
      });

      this.post('/quest', (schema, request) => {
        const body = JSON.parse(request.requestBody);

        if (!body.questName || !body.questType || !body.description || !body.rewardId) {
          return { error: '필수 필드를 입력해주세요' };
        }

        return { message: '퀘스트가 생성되었습니다' };
      });

      this.put('/quest/:id', (schema, request) => {
        const { id } = request.params;
        const body = JSON.parse(request.requestBody);

        if (!body.questName || !body.questType || !body.description || !body.rewardId) {
          return { error: '필수 필드를 입력해주세요' };
        }

        return { message: '퀘스트가 수정되었습니다' };
      });

      this.delete('/quest/:id', (schema, request) => {
        const { id } = request.params;
        return { message: '퀘스트가 삭제되었습니다' };
      });

      this.post('/quest/accept/:id', (schema, request) => {
        const { id } = request.params;
        return { message: '퀘스트를 수락했습니다', questId: Number(id) };
      });

      // Reward API
      this.get('/quest/reward/list', () => {
        return [
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
      });
    },
  });
}
