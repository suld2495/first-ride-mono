import type { RequestResponseStatus } from '@repo/types';

import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

interface ConfirmRequestButtonGroupProps {
  onSubmit: (status: RequestResponseStatus) => void;
}

const ConfirmRequestButtonGroup = ({
  onSubmit,
}: ConfirmRequestButtonGroupProps) => {
  return (
    <ThemeView style={styles.buttonContainer}>
      <Button
        title="승인"
        variant="primary"
        onPress={() => onSubmit('PASS')}
        style={styles.button}
      />
      <Button
        title="거절"
        variant="secondary"
        onPress={() => onSubmit('DENY')}
        style={styles.button}
      />
    </ThemeView>
  );
};

export default ConfirmRequestButtonGroup;

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
