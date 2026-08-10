import React from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useAppTheme } from '@/components/ui/tamagui';

const DEFAULT_SPINNER_SIZE = 24;
const DEFAULT_SPINNER_STROKE_WIDTH = 4;

export interface LoadingSpinnerProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
  testID?: string;
}

export const LoadingSpinner = ({
  color,
  size = DEFAULT_SPINNER_SIZE,
  strokeWidth = DEFAULT_SPINNER_STROKE_WIDTH,
  testID,
}: LoadingSpinnerProps) => {
  const { theme } = useAppTheme();
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const spinnerColor = color ?? theme.colors.text.muted;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [{ rotate }],
      }}
      testID={testID}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          color={spinnerColor}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={spinnerColor}
          strokeDasharray={`${circumference * 0.9} ${circumference * 0.1}`}
          strokeLinecap="butt"
          strokeWidth={strokeWidth}
          testID={testID ? `${testID}-circle` : undefined}
        />
      </Svg>
    </Animated.View>
  );
};

export default LoadingSpinner;
