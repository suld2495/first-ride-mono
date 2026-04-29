import type { FormContextType } from '@repo/shared/components';

import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import ThemeView from '@/components/ui/theme-view';
import type { RequestImage } from '@/hooks/useRequestSubmission';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

interface RequetButtonGroupProps {
  useForm: () => FormContextType<{ images: RequestImage[] }>;
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
    marginTop: baseFoundation.dimension.x10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: baseFoundation.dimension.x10,
  },

  button: {
    flex: 1,
  },
});
