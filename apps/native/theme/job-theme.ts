import type { User } from '@repo/types';

import type { ThemeName } from '@/theme/themes';

type JobThemeName = Extract<ThemeName, 'blue' | 'green' | 'red'>;

type UserJobSource = Partial<
  Pick<User, 'job' | 'jobType' | 'characterCode'>
> | null | undefined;

const normalizeJobSource = (source: UserJobSource) =>
  `${source?.jobType ?? ''} ${source?.characterCode ?? ''} ${
    source?.job ?? ''
  }`.toUpperCase();

export const getThemeNameFromUserJob = (
  source: UserJobSource,
): JobThemeName => {
  const normalizedJob = normalizeJobSource(source);

  if (
    normalizedJob.includes('MAGE') ||
    normalizedJob.includes('메이지') ||
    normalizedJob.includes('마법사')
  ) {
    return 'red';
  }

  if (normalizedJob.includes('ARCHER') || normalizedJob.includes('궁수')) {
    return 'green';
  }

  if (normalizedJob.includes('WARRIOR') || normalizedJob.includes('용사')) {
    return 'blue';
  }

  return 'blue';
};
