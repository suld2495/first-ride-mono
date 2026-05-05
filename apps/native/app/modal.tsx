import { useLocalSearchParams } from 'expo-router';
import { Platform } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalFooterOutlet from '@/components/modal/modal-footer-outlet';
import ModalFooterProvider from '@/components/modal/modal-footer-provider';
import ModalHeader from '@/components/modal/modal-header';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import type { ModalType } from '@/hooks/useModal';
import { useModal } from '@/hooks/useModal';

const MODAL_ANIMATION_DURATION = 250;

export default function Modal() {
  const { type, friendNickname } = useLocalSearchParams<{
    type: ModalType;
    friendNickname?: string;
  }>();
  const [title, ModalComponent, modalOptions] = useModal(type);
  const { theme } = useAppTheme();
  const modalTitle =
    type === 'friend-routines' && friendNickname ? friendNickname : title;
  const insets = useSafeAreaInsets();

  return (
    <ThemeView
      style={[
        styles.wrapper,
        modalOptions.fullBleedBackground && {
          backgroundColor: theme.colors.brand.secondary,
        },
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
        <ModalFooterProvider>
          <ModalHeader
            title={modalTitle}
            transparent={modalOptions.headerTransparent}
          />
          <ThemeView
            style={[
              styles.content,
              modalOptions.contentPadding === false && styles.contentNoPadding,
            ]}
            transparent={modalOptions.contentTransparent}
          >
            <ModalComponent />
          </ThemeView>
          <ModalFooterOutlet />
        </ModalFooterProvider>
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
  },

  content: {
    flex: 1,
    borderRadius: theme.foundation.radii.l,
    paddingHorizontal: theme.foundation.spacing.l,
  },
  contentNoPadding: {
    paddingHorizontal: 0,
  },
}));
