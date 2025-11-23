import { StyleSheet } from 'react-native';
import { FormContextType } from '@repo/shared/components';

import { Button } from '../common/Button';
import Link from '../common/Link';
import ThemeView from '../common/ThemeView';

interface RequetButtonGroupProps {
  useForm: () => FormContextType<{ image: string }>;
}

const RequetButtonGroup = ({ useForm }: RequetButtonGroupProps) => {
  const { enabled, handleSubmit } = useForm();

  return (
    <ThemeView style={styles.buttonContainer}>
      <Link title="취소" href=".." variant="secondary" style={styles.button} />
      <Button
        title="요청"
        variant="primary"
        onPress={() => handleSubmit()}
        style={styles.button}
        disabled={!enabled}
      />
    </ThemeView>
  );
};

export default RequetButtonGroup;

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
