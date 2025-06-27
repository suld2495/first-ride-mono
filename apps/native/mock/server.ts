import { createServer } from 'miragejs';

export function makeServer() {
  return createServer({
    routes() {
      this.urlPrefix = process.env.EXPO_PUBLIC_VITE_BASE_URL || '';
      this.namespace = '/api';

      this.get('/routine/list', () => {
        return [
          {
            routineId: 1,
            nickname: 'moon',
            routineName: '아침 스트레칭',
            startDate: '2025-06-06',
            endDate: '2025-08-31',
            routineDetail: '매일 아침 15분 스트레칭 수행',
            penalty: 10000,
            weeklyCount: 5,
            routineCount: 0,
            mateNickname: 'yunji',
          },
        ];
      });
    },
  });
}
