import type { FormContextType } from '@repo/shared/components';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalFooter from '@/components/modal/modal-footer';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import type { RequestForm } from '@/hooks/useRequestSubmission';
import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

interface RequetButtonGroupProps {
  useForm: () => FormContextType<RequestForm>;
  loading?: boolean;
}

const RequetButtonGroup = ({
  useForm,
  loading = false,
}: RequetButtonGroupProps) => {
  const { enabled, handleSubmit } = useForm();
  const insets = useSafeAreaInsets();

  const footer = useMemo(
    () => (
      <ThemeView
        testID="request-form-button-container"
        transparent
        style={[
          styles.buttonContainer,
          {
            paddingBottom: Math.max(
              insets.bottom,
              styles.buttonContainer.paddingTop,
            ),
          },
        ]}
      >
        <Button
          testID="request-submit-button"
          title="완료"
          variant="primary"
          size="md"
          fullWidth
          backgroundColor={
            enabled
              ? requestFormColors.submit
              : requestFormColors.submitDisabled
          }
          textColor={requestFormColors.submitLabel}
          onPress={() => handleSubmit()}
          style={[styles.submitButton, !enabled && styles.submitButtonDisabled]}
          textStyle={styles.submitLabel}
          disabled={!enabled || loading}
          loading={loading}
        />
      </ThemeView>
    ),
    [enabled, handleSubmit, insets.bottom, loading],
  );

  return <ModalFooter>{footer}</ModalFooter>;
};

export default RequetButtonGroup;

const styles = StyleSheet.create(() => ({
  buttonContainer: {
    width: '100%',
    padding: baseFoundation.spacing[6],
    paddingTop: baseFoundation.spacing[6],
  },
  submitButton: {
    minHeight: baseFoundation.dimension.x44,
    padding: baseFoundation.spacing[3],
    borderRadius: baseFoundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonDisabled: { opacity: 1 },
  submitLabel: {
    fontSize: baseFoundation.typography.size.body2,
    lineHeight: 20.4,
    letterSpacing: -0.3,
  },
}));
