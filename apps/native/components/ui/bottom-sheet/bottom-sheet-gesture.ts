export const BOTTOM_SHEET_DISMISS_DISTANCE = 96;
export const BOTTOM_SHEET_DISMISS_VELOCITY = 900;

interface BottomSheetReleaseMetrics {
  translationY: number;
  velocityY: number;
}

export const getBottomSheetReleaseAction = ({
  translationY,
  velocityY,
}: BottomSheetReleaseMetrics): 'dismiss' | 'restore' => {
  'worklet';

  if (
    translationY >= BOTTOM_SHEET_DISMISS_DISTANCE ||
    velocityY >= BOTTOM_SHEET_DISMISS_VELOCITY
  ) {
    return 'dismiss';
  }

  return 'restore';
};
