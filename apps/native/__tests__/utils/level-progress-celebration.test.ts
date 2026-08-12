import { createLevelProgressCelebration } from '@/utils/level-progress-celebration';

describe('createLevelProgressCelebration', () => {
  it('첫 데이터 로드에서는 축하 모달을 만들지 않는다', () => {
    expect(
      createLevelProgressCelebration(null, {
        currentLevel: 1,
        evolutionCount: 0,
      }),
    ).toBeNull();
  });

  it('레벨만 오르면 레벨업 모달 정보를 만든다', () => {
    expect(
      createLevelProgressCelebration(
        { currentLevel: 1, evolutionCount: 0 },
        { currentLevel: 2, evolutionCount: 0 },
      ),
    ).toEqual({
      type: 'level-up',
      previousLevel: 1,
      currentLevel: 2,
      previousEvolutionCount: 0,
      currentEvolutionCount: 0,
    });
  });

  it('레벨업과 전직이 동시에 일어나면 전직 모달 하나로 합친다', () => {
    expect(
      createLevelProgressCelebration(
        { currentLevel: 4, evolutionCount: 0 },
        { currentLevel: 5, evolutionCount: 1 },
      ),
    ).toEqual({
      type: 'evolution',
      previousLevel: 4,
      currentLevel: 5,
      previousEvolutionCount: 0,
      currentEvolutionCount: 1,
    });
  });

  it('전직 레벨에 도달하면 evolutionCount 갱신 전에도 전직 모달 정보를 만든다', () => {
    expect(
      createLevelProgressCelebration(
        { currentLevel: 9, evolutionCount: 1 },
        { currentLevel: 10, evolutionCount: 1 },
      ),
    ).toEqual({
      type: 'evolution',
      previousLevel: 9,
      currentLevel: 10,
      previousEvolutionCount: 1,
      currentEvolutionCount: 2,
    });
  });
});
