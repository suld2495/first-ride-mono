import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import Checkbox from '@/components/ui/checkbox';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';

interface RoutineCompleteConfirmModalProps {
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (withPhoto: boolean) => void;
  routineName?: string;
  visible: boolean;
}

const RoutineCompleteConfirmModal = ({
  isSubmitting = false,
  onCancel,
  onConfirm,
  routineName,
  visible,
}: RoutineCompleteConfirmModalProps) => {
  const [withPhoto, setWithPhoto] = useState(false);

  useEffect(() => {
    if (!visible) {
      setWithPhoto(false);
    }
  }, [visible]);

  const handleCancel = () => {
    if (isSubmitting) {
      return;
    }

    setWithPhoto(false);
    onCancel();
  };

  const handleConfirm = () => {
    if (isSubmitting) {
      return;
    }

    onConfirm(withPhoto);
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
          {routineName ? (
            <Typography
              color={palette.theme.gray[40]}
              style={styles.routineName}
              textAlign="center"
              variant="caption1"
              weight="medium"
            >
              {routineName}
            </Typography>
          ) : null}

          <View style={styles.optionRow}>
            <Checkbox
              checkedColor={palette.theme.gray[95]}
              fillColor={palette.theme.gray[95]}
              isChecked={withPhoto}
              labelColor={palette.theme.gray[70]}
              onPress={setWithPhoto}
              size="md"
              text="사진 인증하기"
              visualChecked={withPhoto}
            />
          </View>

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
  routineName: {
    marginTop: theme.foundation.spacing[2],
  },
  optionRow: {
    alignSelf: 'center',
    marginTop: theme.foundation.spacing[5],
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
