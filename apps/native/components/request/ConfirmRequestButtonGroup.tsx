import { StyleSheet } from 'react-native-unistyles';
import { FormContextType } from '@repo/shared/components';
import { RequestResponseStatus } from '@repo/types';

import { Button } from '../common/Button';
import ThemeView from '../common/ThemeView';

interface ConfirmRequestButtonGroupProps {
  onSubmit: (status: RequestResponseStatus, comment: string) => Promise<void>;
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
