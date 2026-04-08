import type { FormContextType } from '@repo/shared/components';
import type { RoutineForm } from '@repo/types';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import ThemeView from '@/components/ui/theme-view';
import type { ModalType } from '@/hooks/useModal';

interface FormButtonGroupProps {
  type: ModalType;
  useForm: () => FormContextType<RoutineForm>;
}

const FormButtonGroup = ({ type, useForm }: FormButtonGroupProps) => {
  const { enabled: isValid, handleSubmit } = useForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Link title="취소" href=".." variant="secondary" style={styles.button} />
      {type === 'routine-add' ? (
        <Button
          title="추가"
          variant="primary"
          onPress={() => handleSubmit()}
          style={styles.button}
          disabled={!isValid}
        />
      ) : (
        <Button
          title="수정"
          variant="primary"
          onPress={() => handleSubmit()}
          style={styles.button}
          disabled={!isValid}
        />
      )}
    </ThemeView>
  );
};

export default FormButtonGroup;

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
