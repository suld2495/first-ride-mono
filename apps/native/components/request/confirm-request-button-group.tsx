import type { FormContextType } from '@repo/shared/components';
import type { RequestResponseStatus } from '@repo/types';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import ThemeView from '@/components/ui/theme-view';

interface ConfirmRequestButtonGroupProps {
  onSubmit: (status: RequestResponseStatus, comment: string) => void;
  useForm: () => FormContextType<{ comment: string }>;
}

const ConfirmRequestButtonGroup = ({
  onSubmit,
  useForm,
}: ConfirmRequestButtonGroupProps) => {
  const { form } = useForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Button
        title="승인"
        variant="primary"
        onPress={() => onSubmit('PASS', form.comment)}
        style={styles.button}
      />
      <Button
        title="거절"
        variant="secondary"
        onPress={() => onSubmit('DENY', form.comment)}
        style={styles.button}
      />
    </ThemeView>
  );
};

export default ConfirmRequestButtonGroup;

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },

  button: {
    flex: 1,
  },
});
