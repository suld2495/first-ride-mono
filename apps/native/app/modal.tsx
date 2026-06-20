import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalFooterOutlet from '@/components/modal/modal-footer-outlet';
import ModalFooterProvider from '@/components/modal/modal-footer-provider';
import ModalHeader from '@/components/modal/modal-header';
import ModalHeaderActionProvider from '@/components/modal/modal-header-action-provider';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useModal } from '@/hooks/useModal';
import { useSetRoutineId } from '@/hooks/useRoutineSelection';
import { normalizeModalType, type ModalType } from '@/types/modal';

const MODAL_ANIMATION_DURATION = 250;

export default function Modal() {
  const router = useRouter();
  const user = useAuthUser();
  const { type, friendNickname, routineId } = useLocalSearchParams<{
    type: ModalType;
    friendNickname?: string;
    routineId?: string;
  }>();
  const modalType = normalizeModalType(type);
  const safeModalType = modalType ?? 'routine-add';
  const [title, ModalComponent, modalOptions] = useModal(safeModalType);
  const setRoutineId = useSetRoutineId();
  const { theme } = useAppTheme();
  const modalTitle =
    modalType === 'friend-routines' && friendNickname ? friendNickname : title;
  const insets = useSafeAreaInsets();
  const isPublicModal = modalType === 'policies' || modalType === 'privacy';
  const contentPaddingHorizontal =
    modalOptions.contentPadding === false
      ? 0
      : (modalOptions.contentPaddingHorizontal ?? theme.foundation.spacing[6]);

  useEffect(() => {
    if (!modalType) {
      if (user) {
        router.push('/(tabs)/(afterLogin)/(routine)');
      } else {
        router.replace('/sign-in');
      }
      return;
    }

    if (!user && !isPublicModal) {
      router.replace('/sign-in');
    }
  }, [isPublicModal, modalType, router, user]);

  useEffect(() => {
    if (modalType !== 'request' || !routineId) {
      return;
    }

    const nextRoutineId = Number(routineId);

    if (Number.isFinite(nextRoutineId) && nextRoutineId > 0) {
      setRoutineId(nextRoutineId);
    }
  }, [modalType, routineId, setRoutineId]);

  if (!modalType || (!user && !isPublicModal)) {
    return null;
  }

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
        testID="modal-screen-container"
        entering={SlideInRight.duration(MODAL_ANIMATION_DURATION)}
        style={styles.container}
      >
        <ModalHeaderActionProvider>
          <ModalFooterProvider>
            <ModalHeader
              title={modalTitle}
              transparent={modalOptions.headerTransparent}
              onBackPress={
                !user && isPublicModal
                  ? () => router.replace('/sign-in')
                  : undefined
              }
            />
            <ThemeView
              testID="modal-screen-content"
              style={[
                styles.content,
                {
                  paddingHorizontal: contentPaddingHorizontal,
                },
              ]}
              transparent={modalOptions.contentTransparent}
            >
              <ModalComponent />
            </ThemeView>
            <ModalFooterOutlet />
          </ModalFooterProvider>
        </ModalHeaderActionProvider>
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
  },

  content: {
    flex: 1,
    borderRadius: theme.foundation.radii.l,
    marginTop: 0,
    paddingTop: 0,
  },
}));
