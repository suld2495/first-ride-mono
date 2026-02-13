import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.5 };

const SCALE_PRESSED = 1.4;
const SCALE_ADJACENT = 1.15;
const SCALE_DEFAULT = 1.0;
const SCALE_ACTIVE_IDLE = 1.1;

interface UseDockMagnificationReturn {
  getAnimatedScale: (itemIndex: number) => ReturnType<typeof useAnimatedStyle>;
  handlePressIn: (index: number) => void;
  handlePressOut: () => void;
  setActiveIndex: (index: number) => void;
}

export function useDockMagnification(): UseDockMagnificationReturn {
  const pressedIndex = useSharedValue(-1);
  const activeIndex = useSharedValue(0);

  const getAnimatedScale = (itemIndex: number) => {
    return useAnimatedStyle(() => {
      let targetScale = SCALE_DEFAULT;

      if (pressedIndex.value >= 0) {
        const distance = Math.abs(itemIndex - pressedIndex.value);

        if (distance === 0) {
          targetScale = SCALE_PRESSED;
        } else if (distance === 1) {
          targetScale = SCALE_ADJACENT;
        } else {
          targetScale = SCALE_DEFAULT;
        }
      } else {
        targetScale =
          itemIndex === activeIndex.value ? SCALE_ACTIVE_IDLE : SCALE_DEFAULT;
      }

      return {
        transform: [{ scale: withSpring(targetScale, SPRING_CONFIG) }],
      };
    });
  };

  const handlePressIn = useCallback(
    (index: number) => {
      pressedIndex.value = index;
    },
    [pressedIndex],
  );

  const handlePressOut = useCallback(() => {
    pressedIndex.value = -1;
  }, [pressedIndex]);

  const setActiveIndex = useCallback(
    (index: number) => {
      activeIndex.value = index;
    },
    [activeIndex],
  );

  return {
    getAnimatedScale,
    handlePressIn,
    handlePressOut,
    setActiveIndex,
  };
}
