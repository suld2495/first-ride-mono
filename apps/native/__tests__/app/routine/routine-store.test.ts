import type * as RoutineStoreModule from '../../../store/routine.store';

const { useRoutineStore } = jest.requireActual<typeof RoutineStoreModule>(
  '../../../store/routine.store',
);

describe('routine store', () => {
  it('루틴 표시를 요일별 상태로 초기화한다', () => {
    expect(useRoutineStore.getState().type).toBe('week');
  });

  it('새 루틴은 혼자 체크하는 상태로 초기화한다', () => {
    useRoutineStore.getState().resetRoutineForm();

    expect(useRoutineStore.getState().routineForm.isMe).toBe(true);
  });
});
