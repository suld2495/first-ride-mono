import React from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { palette } from '@/theme/tokens';

const DEFAULT_SPINNER_COLOR = palette.theme.gray[10];
const DEFAULT_SPINNER_SIZE = 24;
const DEFAULT_SPINNER_STROKE_WIDTH = 4;

export interface LoadingSpinnerProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
  testID?: string;
}

export const LoadingSpinner = ({
  color = DEFAULT_SPINNER_COLOR,
  size = DEFAULT_SPINNER_SIZE,
  strokeWidth = DEFAULT_SPINNER_STROKE_WIDTH,
  testID,
}: LoadingSpinnerProps) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={`${circumference * 0.9} ${circumference * 0.1}`}
          strokeLinecap="butt"
          strokeWidth={strokeWidth}
        />
      </Svg>
    </Animated.View>
  );
};

export default LoadingSpinner;
