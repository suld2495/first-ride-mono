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

  it('날짜 선택 페이지의 초기값과 확정값을 전달한다', () => {
    useRoutineStore
      .getState()
      .beginRoutineDateSelection('2026-07-31', '2026-08-01');

    expect(useRoutineStore.getState().routineDateSelection).toEqual({
      initialStartDate: '2026-07-31',
      initialEndDate: '2026-08-01',
      confirmedStartDate: null,
      confirmedEndDate: null,
    });

    useRoutineStore
      .getState()
      .confirmRoutineDateSelection('2026-08-02', '2026-08-03');

    expect(useRoutineStore.getState().routineDateSelection).toEqual({
      initialStartDate: '2026-07-31',
      initialEndDate: '2026-08-01',
      confirmedStartDate: '2026-08-02',
      confirmedEndDate: '2026-08-03',
    });

    useRoutineStore.getState().clearRoutineDateSelection();

    expect(useRoutineStore.getState().routineDateSelection).toBeNull();
  });
});
