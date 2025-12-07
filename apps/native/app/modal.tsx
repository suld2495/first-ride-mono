import Animated, { SlideInRight } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { useLocalSearchParams } from 'expo-router';

import ThemeView from '@/components/common/ThemeView';
import Container from '@/components/layout/Container';
import ModalHeader from '@/components/modal/ModalHeader';
import { ModalType, useModal } from '@/hooks/useModal';

const MODAL_ANIMATION_DURATION = 250;

export default function Modal() {
  const { type } = useLocalSearchParams<{ type: ModalType }>();
  const [title, ModalComponent] = useModal(type);

  return (
    <Container>
      <Animated.View
        entering={SlideInRight.duration(MODAL_ANIMATION_DURATION)}
        style={styles.container}
      >
        <ModalHeader title={title} />
        <ThemeView style={styles.content}>
          <ModalComponent />
        </ThemeView>
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 15,
  },

  content: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
});
