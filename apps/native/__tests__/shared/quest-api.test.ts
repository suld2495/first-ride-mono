import axiosInstance from '@repo/shared/api';
import { fetchQuests } from '@repo/shared/api/quest.api';
import MockAdapter from 'axios-mock-adapter';

let mockAxios: MockAdapter;

describe('quest.api', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('fetchQuests', () => {
    it('완료 여부 필터를 쿼리스트링에 포함한다', async () => {
      mockAxios
        .onGet('/quest/list?status=ACTIVE&completed=false')
        .reply(200, { data: [] });

      const result = await fetchQuests({
        status: 'ACTIVE',
        completed: false,
      });

      expect(result).toEqual([]);
      expect(mockAxios.history.get[0]?.url).toBe(
        '/quest/list?status=ACTIVE&completed=false',
      );
    });
  });
});
