import type { FormContextType } from '@repo/shared/components';
import type { RequestResponseStatus } from '@repo/types';
import { Alert } from 'react-native';

import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { baseFoundation } from '@/theme/tokens';

interface ConfirmRequestButtonGroupProps {
  onSubmit: (status: RequestResponseStatus, comment: string) => void;
  useForm: () => FormContextType<{ comment: string }>;
}

const ConfirmRequestButtonGroup = ({
  onSubmit,
  useForm,
}: ConfirmRequestButtonGroupProps) => {
  const { form } = useForm();
  const requestConfirmation = (status: RequestResponseStatus) => {
    const isApproval = status === 'PASS';
    const actionLabel = isApproval ? '승인' : '거절';

    Alert.alert(
      `루틴 요청 ${actionLabel}`,
      `이 루틴 인증 요청을 ${actionLabel}하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: actionLabel,
          style: isApproval ? 'default' : 'destructive',
          onPress: () => onSubmit(status, form.comment),
        },
      ],
    );
  };

  return (
    <ThemeView style={styles.buttonContainer}>
      <Button
        title="승인"
        variant="primary"
        onPress={() => requestConfirmation('PASS')}
        style={styles.button}
      />
      <Button
        title="거절"
        variant="secondary"
        onPress={() => requestConfirmation('DENY')}
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
