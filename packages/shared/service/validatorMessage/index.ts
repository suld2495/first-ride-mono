import { RoutineForm } from '@repo/types';

import { Validators } from '../../components';

type InternalFormType = Omit<RoutineForm, 'penalty' | 'routineCount'> & {
  penalty: string | number;
  routineCount: string | number;
};

export const routineFormValidators: Validators<InternalFormType> = {
  routineName: (value) => {
    if (!value) {
      return '루틴 이름을 입력해주세요.';
    }
  },
  routineDetail(value) {
    if (!value) {
      return '루틴 설명을 입력해주세요.';
    }
  },
  penalty(value) {
    if (!value) {
      return '벌금을 입력해주세요.';
    }

    const penalty = Number(value) || 0;

    if (penalty < 0) {
      return '벌금은 0원 이상으로 입력해주세요.';
    }
  },
  routineCount(value) {
    if (!value) {
      return '루틴 횟수를 입력해주세요.';
    }

    const count = Number(value) || 0;

    if (count < 1 || count > 7) {
      return '루틴 횟수는 1 에서 7 사이로 입력해주세요.';
    }
  },
  startDate(value) {
    if (!value) {
      return '시작 날짜를 입력해주세요.';
    }
  },
};

export const requestFormValidators: Validators<{ image: string }> = {
  image: (value) => {
    if (!value) {
      return '이미지를 추가해주세요.';
    }
  },
};
