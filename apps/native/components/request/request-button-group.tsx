import type { FormContextType } from '@repo/shared/components';
import { StyleSheet } from '@/lib/unistyles';

import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import ThemeView from '@/components/ui/theme-view';

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
