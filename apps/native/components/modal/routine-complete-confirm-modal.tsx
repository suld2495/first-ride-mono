import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

interface RoutineCompleteConfirmModalProps {
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
}

const RoutineCompleteConfirmModal = ({
  isSubmitting = false,
  onCancel,
  onConfirm,
  visible,
}: RoutineCompleteConfirmModalProps) => {
  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }

    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleCancel}
      transparent
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.root} testID="routine-complete-confirm-overlay">
        <Pressable
          accessibilityLabel="루틴 완료 확인 닫기"
          disabled={isSubmitting}
          onPress={handleCancel}
          style={styles.backdrop}
          testID="routine-complete-confirm-backdrop"
        />
        <View
          accessibilityViewIsModal
          style={styles.card}
          testID="routine-complete-confirm-modal"
        >
          <Typography
            color={palette.theme.gray[80]}
            textAlign="center"
            variant="subtitle2"
            weight="bold"
          >
            루틴을 완료하셨나요?
          </Typography>
          <View style={styles.buttonRow}>
            <Button
              disabled={isSubmitting}
              fullWidth
              onPress={handleCancel}
              size="md"
              style={styles.secondaryButton}
              textColor={palette.theme.gray[70]}
              variant="secondary"
            >
              아니요
            </Button>
            <Button
              backgroundColor={palette.theme.gray[95]}
              disabled={isSubmitting}
              fullWidth
              loading={isSubmitting}
              onPress={handleConfirm}
              size="md"
              style={styles.primaryButton}
              textColor={palette.white}
            >
              예
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RoutineCompleteConfirmModal;

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[6],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 3, 6, 0.48)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: baseFoundation.dimension.x16,
    padding: theme.foundation.spacing[5],
    backgroundColor: palette.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[3],
    marginTop: theme.foundation.spacing[5],
  },
  secondaryButton: {
    flex: 1,
    borderRadius: baseFoundation.dimension.x8,
    backgroundColor: palette.theme.gray[5],
  },
  primaryButton: {
    flex: 1,
    borderRadius: baseFoundation.dimension.x8,
  },
}));
