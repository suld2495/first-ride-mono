import React from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BottomSheetDragContext } from '@/components/ui/bottom-sheet/bottom-sheet-drag-context';
import { getBottomSheetReleaseAction } from '@/components/ui/bottom-sheet/bottom-sheet-gesture';
import { StyleSheet, type AppThemes } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

interface BottomSheetProps {
  visible: boolean;
  label: string;
  onRequestClose: () => void;
  onClosed?: () => void;
  children: React.ReactNode;
}

const SHEET_ANIMATION_DURATION = baseFoundation.motion.duration.normal;
const BOTTOM_SHEET_MAX_WIDTH = 520;
const DRAG_ACTIVATION_DISTANCE = baseFoundation.dimension.x5;
const RESTORE_SPRING_CONFIG = {
  damping: 22,
  mass: 0.8,
  stiffness: 240,
} as const;

const BottomSheet = ({
  visible,
  label,
  onRequestClose,
  onClosed,
  children,
}: BottomSheetProps) => {
  const { height: windowHeight } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = React.useState(visible);
  const [isContentVisible, setIsContentVisible] = React.useState(visible);
  const translateY = useSharedValue(0);
  const isDragDismissInProgress = useSharedValue(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    clearCloseTimer();

    if (visible) {
      translateY.value = 0;
      isDragDismissInProgress.value = false;
      setIsModalVisible(true);
      setIsContentVisible(true);

      return clearCloseTimer;
    }

    if (!isModalVisible) {
      return clearCloseTimer;
    }

    setIsContentVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setIsModalVisible(false);
      closeTimerRef.current = null;
      onClosed?.();
    }, SHEET_ANIMATION_DURATION);

    return clearCloseTimer;
  }, [
    clearCloseTimer,
    isDragDismissInProgress,
    isModalVisible,
    onClosed,
    translateY,
    visible,
  ]);

  const dragGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .withTestId('bottom-sheet-drag-gesture')
        .activeOffsetY([-DRAG_ACTIVATION_DISTANCE, DRAG_ACTIVATION_DISTANCE])
        .onBegin(() => {
          if (!isDragDismissInProgress.value) {
            cancelAnimation(translateY);
          }
        })
        .onUpdate((event) => {
          if (!isDragDismissInProgress.value) {
            translateY.value = Math.max(0, event.translationY);
          }
        })
        .onEnd((event, succeeded) => {
          if (!succeeded || isDragDismissInProgress.value) {
            if (!isDragDismissInProgress.value) {
              translateY.value = withSpring(0, RESTORE_SPRING_CONFIG);
            }
            return;
          }

          const releaseAction = getBottomSheetReleaseAction({
            translationY: event.translationY,
            velocityY: event.velocityY,
          });

          if (releaseAction === 'dismiss') {
            isDragDismissInProgress.value = true;
            translateY.value = withTiming(
              windowHeight,
              { duration: SHEET_ANIMATION_DURATION },
              (finished) => {
                if (finished) {
                  runOnJS(onRequestClose)();
                }
              },
            );
            return;
          }

          translateY.value = withSpring(0, RESTORE_SPRING_CONFIG);
        })
        .onFinalize((_event, succeeded) => {
          if (!succeeded && !isDragDismissInProgress.value) {
            translateY.value = withSpring(0, RESTORE_SPRING_CONFIG);
          }
        }),
    [isDragDismissInProgress, onRequestClose, translateY, windowHeight],
  );

  const dragAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={isModalVisible}
      animationType="none"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onRequestClose}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.modalRoot}>
          {isContentVisible && (
            <>
              <Animated.View
                testID="bottom-sheet-backdrop"
                entering={FadeIn.duration(SHEET_ANIMATION_DURATION)}
                exiting={FadeOut.duration(SHEET_ANIMATION_DURATION)}
                style={styles.backdrop}
              >
                <Pressable
                  accessibilityLabel={`${label} 닫기`}
                  style={styles.backdropPressable}
                  onPress={onRequestClose}
                />
              </Animated.View>
              <Animated.View
                testID="bottom-sheet-container"
                entering={SlideInDown.duration(SHEET_ANIMATION_DURATION)}
                exiting={SlideOutDown.duration(SHEET_ANIMATION_DURATION)}
                style={styles.container}
              >
                <Animated.View
                  style={[styles.draggableContainer, dragAnimatedStyle]}
                >
                  <Pressable
                    accessibilityLabel={`${label} 바텀 시트`}
                    accessibilityViewIsModal
                    onPress={(event) => event?.stopPropagation?.()}
                    style={styles.pressable}
                  >
                    <ThemeView style={styles.content} variant="surface">
                      <BottomSheetDragContext.Provider value={dragGesture}>
                        {children}
                      </BottomSheetDragContext.Provider>
                    </ThemeView>
                  </Pressable>
                </Animated.View>
              </Animated.View>
            </>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
  gestureRoot: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  backdropPressable: {
    flex: 1,
  },
  container: {
    width: '100%',
    maxWidth: BOTTOM_SHEET_MAX_WIDTH,
    maxHeight: '88%',
    alignSelf: 'center',
  },
  draggableContainer: {
    width: '100%',
    maxHeight: '100%',
    borderTopLeftRadius: baseFoundation.radii.xl,
    borderTopRightRadius: baseFoundation.radii.xl,
    backgroundColor: theme.colors.brand.primary,
    overflow: 'hidden',
  },
  pressable: {
    flexShrink: 1,
    minHeight: 0,
  },
  content: {
    flexShrink: 1,
    minHeight: 0,
    gap: theme.foundation.spacing[4],
    paddingTop: theme.foundation.spacing[2],
    paddingHorizontal: theme.foundation.spacing[4],
    backgroundColor: theme.colors.brand.primary,
  },
}));
