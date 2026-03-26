import { createMockQuest } from './mock';

describe('createMockQuest', () => {
  it('문서 기준 검증 타입과 목표 횟수를 기본으로 포함한다', () => {
    const quest = createMockQuest();

    expect(quest.verificationType).toBe('WEEKLY_APP_VISIT');
    expect(quest.verificationTargetCount).toBe(1);
  });
});
