import ModalFooterProvider from '@/components/modal/modal-footer-provider';
import ModalHeader from '@/components/modal/modal-header';
import RequestModal from '@/components/modal/request-modal';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';

const previewDetail = {
  isMe: false,
  mateNickname: '메이트',
  nickname: '나',
  paused: false,
  photoRequired: true,
  routineDetail: '아침에 일어나서 물 한 잔을 마셔요.',
  routineName: '물 마시기',
};

export default function RoutineRequestPreview() {
  return (
    <ThemeView style={styles.container}>
      <ModalFooterProvider>
        <ModalHeader title="루틴 인증" />
        <ThemeView style={styles.content}>
          <RequestModal previewDetail={previewDetail} />
        </ThemeView>
      </ModalFooterProvider>
    </ThemeView>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
  },
}));
