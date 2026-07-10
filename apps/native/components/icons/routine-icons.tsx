/* eslint-disable local-rules/no-multiple-components-in-file */
import { StyleSheet } from 'react-native';
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

interface RoutineRequestIconProps {
  color: string;
}

export const ROUTINE_REQUEST_ICON_WIDTH = 3;
export const ROUTINE_REQUEST_ICON_HEIGHT = 14;

export const RoutineRequestIcon = ({ color }: RoutineRequestIconProps) => (
  <Svg
    testID="routine-request-icon"
    width={ROUTINE_REQUEST_ICON_WIDTH}
    height={ROUTINE_REQUEST_ICON_HEIGHT}
    viewBox="0 0 3 14"
    fill="none"
  >
    <Path
      d="M1.45835 7.29297C1.86106 7.29297 2.18752 6.96651 2.18752 6.5638C2.18752 6.16109 1.86106 5.83464 1.45835 5.83464C1.05565 5.83464 0.729187 6.16109 0.729187 6.5638C0.729187 6.96651 1.05565 7.29297 1.45835 7.29297Z"
      stroke={color}
      strokeWidth={1.45833}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.45835 2.1888C1.86106 2.1888 2.18752 1.86234 2.18752 1.45964C2.18752 1.05693 1.86106 0.730469 1.45835 0.730469C1.05565 0.730469 0.729187 1.05693 0.729187 1.45964C0.729187 1.86234 1.05565 2.1888 1.45835 2.1888Z"
      stroke={color}
      strokeWidth={1.45833}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.45835 12.3971C1.86106 12.3971 2.18752 12.0707 2.18752 11.668C2.18752 11.2653 1.86106 10.9388 1.45835 10.9388C1.05565 10.9388 0.729187 11.2653 0.729187 11.668C0.729187 12.0707 1.05565 12.3971 1.45835 12.3971Z"
      stroke={color}
      strokeWidth={1.45833}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface RoutineCheckmarkIconProps {
  color: string;
  size: number;
}

interface RoutineMissedIconProps {
  color: string;
  size?: number;
}

export const RoutineMissedIcon = ({
  color,
  size = 12,
}: RoutineMissedIconProps) => (
  <Svg
    testID="routine-missed-icon"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    color={color}
    style={styles.missedIcon}
  >
    <Path
      d="M8.39999 2.79688L2.79999 8.39688"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.79999 2.79688L8.39999 8.39688"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  missedIcon: {
    transform: [{ translateX: 0.4 }, { translateY: 0.4 }],
  },
});

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
      color={color}
    >
      <Path
        d="M1.25 4.91667L3.69444 7.36111L9.80556 1.25"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
