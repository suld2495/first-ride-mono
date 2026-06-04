import { getThemeNameFromUserJob } from '@/theme/job-theme';

describe('job theme mapping', () => {
  it('직업이 곧 고정 테마 컬러가 된다', () => {
    expect(getThemeNameFromUserJob({ jobType: 'WARRIOR' })).toBe('blue');
    expect(getThemeNameFromUserJob({ jobType: 'MAGE' })).toBe('red');
    expect(getThemeNameFromUserJob({ jobType: 'ARCHER' })).toBe('green');
  });

  it('캐릭터 코드로도 직업 테마를 해석한다', () => {
    expect(getThemeNameFromUserJob({ characterCode: 'WARRIOR_BEGINNER' })).toBe(
      'blue',
    );
    expect(
      getThemeNameFromUserJob({ characterCode: 'MAGE_INTERMEDIATE' }),
    ).toBe('red');
    expect(
      getThemeNameFromUserJob({ characterCode: 'ARCHER_INTERMEDIATE' }),
    ).toBe('green');
  });

  it('한국어 직업명으로도 직업 테마를 해석한다', () => {
    expect(getThemeNameFromUserJob({ job: '검사' })).toBe('blue');
    expect(getThemeNameFromUserJob({ job: '마법사' })).toBe('red');
    expect(getThemeNameFromUserJob({ job: '메이지' })).toBe('red');
    expect(getThemeNameFromUserJob({ job: '궁수' })).toBe('green');
  });

  it('해석할 수 없는 직업 값은 블루 테마로 처리한다', () => {
    expect(getThemeNameFromUserJob({ job: 'Dd ' })).toBe('blue');
    expect(getThemeNameFromUserJob(undefined)).toBe('blue');
  });
});
