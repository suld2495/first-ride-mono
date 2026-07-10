import type { FormContextType } from '@repo/shared/components';
import { useMemo } from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalFooter from '@/components/modal/modal-footer';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import type { RequestImage } from '@/hooks/useRequestSubmission';
import { baseFoundation } from '@/theme/tokens';

interface RequetButtonGroupProps {
  useForm: () => FormContextType<{ images: RequestImage[] }>;
  loading?: boolean;
}

const RequetButtonGroup = ({
  useForm,
  loading = false,
}: RequetButtonGroupProps) => {
  const { theme } = useAppTheme();
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
        <ThemeView
          testID="request-cancel-button"
          transparent
          style={styles.cancelButton}
        >
          <Link
            title="취소"
            href=".."
            variant="outline"
            size="md"
            fullWidth
            textColor={theme.colors.action.primary.default}
            style={styles.button}
            disabled={loading}
          />
        </ThemeView>
        <Button
          testID="request-submit-button"
          title="요청"
          variant="primary"
          size="md"
          onPress={() => handleSubmit()}
          style={[
            styles.button,
            styles.submitButton,
            !enabled && styles.submitButtonDisabled,
          ]}
          disabled={!enabled || loading}
          loading={loading}
        />
      </ThemeView>
    ),
    [
      enabled,
      handleSubmit,
      insets.bottom,
      loading,
      theme.colors.action.primary.default,
    ],
  );

  return <ModalFooter>{footer}</ModalFooter>;
};

export default RequetButtonGroup;

const styles = StyleSheet.create((theme) => ({
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[4],
    borderTopWidth: RNStyleSheet.hairlineWidth,
    borderTopColor: theme.colors.brand.bottomTab,
    backgroundColor: theme.colors.background.base,
  },

  button: {
    borderRadius: theme.foundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },

  cancelButton: {
    width: baseFoundation.dimension.x140,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: theme.foundation.radii.xs,
    backgroundColor: theme.colors.brand.card,
  },

  submitButton: {
    flex: 1,
  },

  submitButtonDisabled: {
    opacity: 1,
    backgroundColor: theme.colors.brand.bottomTab,
  },
}));
