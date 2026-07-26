import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

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

const BottomSheet = ({
  visible,
  label,
  onRequestClose,
  onClosed,
  children,
}: BottomSheetProps) => {
  const [isModalVisible, setIsModalVisible] = React.useState(visible);
  const [isContentVisible, setIsContentVisible] = React.useState(visible);
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
  }, [clearCloseTimer, isModalVisible, onClosed, visible]);

  return (
    <Modal
      visible={isModalVisible}
      animationType="none"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onRequestClose}
    >
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
              <Pressable
                accessibilityLabel={`${label} 바텀 시트`}
                accessibilityViewIsModal
                onPress={(event) => event?.stopPropagation?.()}
                style={styles.pressable}
              >
                <ThemeView style={styles.content} variant="surface">
                  {children}
                </ThemeView>
              </Pressable>
            </Animated.View>
          </>
        )}
      </View>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create((theme: AppThemes['light']) => ({
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
