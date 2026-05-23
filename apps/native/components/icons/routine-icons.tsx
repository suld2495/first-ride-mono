import Svg, { Path } from 'react-native-svg';

interface RoutineMoreIndicatorIconProps {
  color: string;
}

export const RoutineMoreIndicatorIcon = ({
  color,
}: RoutineMoreIndicatorIconProps) => (
  <Svg
    testID="routine-more-indicator-icon"
    width={14}
    height={8}
    viewBox="0 0 14 8"
    fill="none"
  >
    <Path
      d="M1 1L7 7L13 1"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface RoutineCheckmarkIconProps {
  color: string;
  size: number;
}

const ROUTINE_CHECKMARK_WIDTH = 12;
const ROUTINE_CHECKMARK_HEIGHT = 9;
const ROUTINE_CHECKMARK_SCALE = 0.7;

export const RoutineCheckmarkIcon = ({
  color,
  size,
}: RoutineCheckmarkIconProps) => {
  const scaledWidth = size * ROUTINE_CHECKMARK_SCALE;
  const scaledHeight =
    (scaledWidth * ROUTINE_CHECKMARK_HEIGHT) / ROUTINE_CHECKMARK_WIDTH;

  return (
    <Svg
      testID="routine-checkmark-icon"
      width={scaledWidth}
      height={scaledHeight}
      viewBox="0 0 12 9"
      fill="none"
    >
      <Path
        d="M1.25 4.91667L3.69444 7.36111L9.80556 1.25"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
