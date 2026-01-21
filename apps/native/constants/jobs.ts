import { SelectItem } from '@/components/common/Select';

/**
 * 직업 타입 정의
 */
export type JobType = '마법사' | '궁수' | '검사';

/**
 * 직업 선택 옵션
 */
export const JOB_OPTIONS: SelectItem<JobType>[] = [
  { label: '마법사', value: '마법사' },
  { label: '궁수', value: '궁수' },
  { label: '검사', value: '검사' },
];
