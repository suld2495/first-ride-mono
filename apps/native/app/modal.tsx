import { useLocalSearchParams } from 'expo-router';
import { Platform } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import ModalHeader from '@/components/modal/modal-header';
import ThemeView from '@/components/ui/theme-view';
import type { ModalType } from '@/hooks/useModal';
import { useModal } from '@/hooks/useModal';

const MODAL_ANIMATION_DURATION = 250;

export default function Modal() {
  const { type } = useLocalSearchParams<{ type: ModalType }>();
  const [title, ModalComponent] = useModal(type);
  const insets = useSafeAreaInsets();

  return (
    <ThemeView
      style={[
        styles.wrapper,
        {
          paddingTop: Platform.select({
            ios: insets.top, // iOS Modal Sheet handles transparency, but usually needs spacing if full screen
            android: insets.top,
          }),
        },
      ]}
    >
      <Animated.View
        entering={SlideInRight.duration(MODAL_ANIMATION_DURATION)}
        style={styles.container}
      >
        <ModalHeader title={title} />
        <ThemeView style={styles.content}>
          <ModalComponent />
        </ThemeView>
      </Animated.View>
    </ThemeView>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingTop: theme.foundation.spacing.s,
    paddingBottom: theme.foundation.spacing.m,
  },

  content: {
    flex: 1,
    borderRadius: theme.foundation.radii.l,
    paddingHorizontal: theme.foundation.spacing.s,
  },
}));
