import type { FormContextType } from '@repo/shared/components';
import type { RoutineForm } from '@repo/types';
import { useEffect, useMemo } from 'react';

import ModalHeaderAction from '@/components/modal/modal-header-action';
import { Button } from '@/components/ui/button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import type { ModalType } from '@/hooks/useModal';
import { baseFoundation, palette } from '@/theme/tokens';

interface FormButtonGroupProps {
  type: ModalType;
  useForm: () => FormContextType<RoutineForm>;
  hasPendingChangeRequest: boolean;
  isPending: boolean;
  onCancelChangeRequest: () => void;
}

const FormButtonGroup = ({
  type,
  useForm,
  hasPendingChangeRequest,
  isPending,
  onCancelChangeRequest,
}: FormButtonGroupProps) => {
  const { theme } = useAppTheme();
  const { enabled: isValid, handleSubmit, validateAll } = useForm();

  useEffect(() => {
    validateAll();
  }, [validateAll]);

  const headerAction = useMemo(
    () => (
      <Button
        accessibilityLabel={
          type === 'routine-add'
            ? '루틴 생성'
            : hasPendingChangeRequest
              ? '루틴 수정 요청 취소'
              : '루틴 저장'
        }
        backgroundColor={theme.colors.text.gray}
        disabled={!hasPendingChangeRequest && !isValid}
        loading={isPending}
        onPress={
          hasPendingChangeRequest ? onCancelChangeRequest : () => handleSubmit()
        }
        size="sm"
        style={styles.headerButton}
        textColor={palette.white}
        textStyle={styles.headerButtonText}
        variant="ghost"
        testID="routine-form-button-container"
      >
        {type === 'routine-add'
          ? '생성'
          : hasPendingChangeRequest
            ? '수정 요청 보냄'
            : '저장'}
      </Button>
    ),
    [
      handleSubmit,
      hasPendingChangeRequest,
      isPending,
      isValid,
      onCancelChangeRequest,
      theme.colors.text.gray,
      type,
    ],
  );

  return <ModalHeaderAction>{headerAction}</ModalHeaderAction>;
};

export default FormButtonGroup;

const styles = StyleSheet.create((theme) => ({
  headerButton: {
    minWidth: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x28,
    minHeight: baseFoundation.dimension.x28,
    borderRadius: theme.foundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: 0,
  },
  headerButtonText: {
    fontSize: theme.foundation.typography.size.body3,
    fontWeight: theme.foundation.typography.weight.regular,
  },
}));
