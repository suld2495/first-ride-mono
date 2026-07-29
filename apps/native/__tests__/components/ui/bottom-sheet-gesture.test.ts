import {
  BOTTOM_SHEET_DISMISS_DISTANCE,
  BOTTOM_SHEET_DISMISS_VELOCITY,
  getBottomSheetReleaseAction,
} from '@/components/ui/bottom-sheet/bottom-sheet-gesture';

describe('getBottomSheetReleaseAction', () => {
  it('조금 아래로 드래그하면 원래 위치로 복귀한다', () => {
    expect(
      getBottomSheetReleaseAction({
        translationY: BOTTOM_SHEET_DISMISS_DISTANCE - 1,
        velocityY: BOTTOM_SHEET_DISMISS_VELOCITY - 1,
      }),
    ).toBe('restore');
  });

  it('기준 거리까지 아래로 드래그하면 바텀 시트를 닫는다', () => {
    expect(
      getBottomSheetReleaseAction({
        translationY: BOTTOM_SHEET_DISMISS_DISTANCE,
        velocityY: 0,
      }),
    ).toBe('dismiss');
  });

  it('짧게 움직여도 빠르게 아래로 스와이프하면 바텀 시트를 닫는다', () => {
    expect(
      getBottomSheetReleaseAction({
        translationY: 1,
        velocityY: BOTTOM_SHEET_DISMISS_VELOCITY,
      }),
    ).toBe('dismiss');
  });

  it('위로 드래그하거나 빠르게 올리면 바텀 시트를 닫지 않는다', () => {
    expect(
      getBottomSheetReleaseAction({
        translationY: -BOTTOM_SHEET_DISMISS_DISTANCE,
        velocityY: -BOTTOM_SHEET_DISMISS_VELOCITY,
      }),
    ).toBe('restore');
  });
});
