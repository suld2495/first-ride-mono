import type { FormContextType } from '@repo/shared/components';
import type { RoutineForm } from '@repo/types';
import { useEffect, useMemo } from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalFooter from '@/components/modal/modal-footer';
import { Button } from '@/components/ui/button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import type { ModalType } from '@/types/modal';

interface FormButtonGroupProps {
  type: ModalType;
  useForm: () => FormContextType<RoutineForm>;
}

const FormButtonGroup = ({ type, useForm }: FormButtonGroupProps) => {
  const { theme } = useAppTheme();
  const { enabled: isValid, handleSubmit, validateAll } = useForm();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    validateAll();
  }, [validateAll]);

  const footer = useMemo(
    () => (
      <ThemeView
        testID="routine-form-button-container"
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
        {type === 'routine-add' ? (
          <Button
            title="등록"
            backgroundColor={theme.colors.text.gray}
            variant="primary"
            onPress={() => handleSubmit()}
            style={styles.button}
            disabled={!isValid}
          />
        ) : (
          <Button
            title="수정"
            variant="primary"
            backgroundColor={theme.colors.text.gray}
            onPress={() => handleSubmit()}
            style={styles.button}
            disabled={!isValid}
          />
        )}
      </ThemeView>
    ),
    [handleSubmit, insets.bottom, isValid, theme.colors.text.gray, type],
  );

  return <ModalFooter>{footer}</ModalFooter>;
};

export default FormButtonGroup;

const styles = StyleSheet.create((theme) => ({
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[4],
    borderTopWidth: RNStyleSheet.hairlineWidth,
    borderTopColor: theme.colors.brand.bottomTab,
  },

  button: {
    flex: 1,
    borderRadius: 8,
  },
}));
