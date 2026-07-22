import { useDeleteAccountMutation } from '@repo/shared/hooks/useAuth';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import { deletePushToken } from '@/api/push-token.api';
import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import PasswordInput from '@/components/ui/password-input';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useToast } from '@/contexts/ToastContext';
import { useAuthSignOutLocally, useAuthUser } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import { getApiErrorMessage } from '@/utils/error-utils';

const DELETE_ACCOUNT_ERROR_MESSAGE = '회원 탈퇴에 실패했습니다.';

export default function DeleteAccountPage() {
  const user = useAuthUser();
  const { data: currentUser } = useFetchMeQuery(user?.userId);
  const deleteAccountMutation = useDeleteAccountMutation();
  const signOutLocally = useAuthSignOutLocally();
  const { pushToken } = useNotifications();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const loginType = currentUser?.loginType ?? user?.loginType;
  const isPlainAccount = loginType === 'PLAIN';
  const canSubmit =
    Boolean(loginType) &&
    (!isPlainAccount || password.trim().length > 0) &&
    !deleteAccountMutation.isPending;

  const handleDeleteAccount = useCallback(async () => {
    try {
      const response = await deleteAccountMutation.mutateAsync(
        isPlainAccount ? { password } : undefined,
      );

      if (pushToken?.data) {
        try {
          await deletePushToken(pushToken.data);
        } catch {
          // 탈퇴가 완료된 뒤에는 푸시 토큰 삭제 실패와 관계없이 세션을 정리한다.
        }
      }

      showToast(response.message, 'success');
      await signOutLocally();
    } catch (error) {
      const fallbackMessage =
        error instanceof Error && error.message
          ? error.message
          : DELETE_ACCOUNT_ERROR_MESSAGE;

      showToast(getApiErrorMessage(error, fallbackMessage), 'error');
    }
  }, [
    deleteAccountMutation,
    isPlainAccount,
    password,
    pushToken?.data,
    showToast,
    signOutLocally,
  ]);

  const handleConfirm = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    Alert.alert(
      '회원 탈퇴',
      '탈퇴한 계정과 개인정보는 복구할 수 없습니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '회원 탈퇴',
          style: 'destructive',
          onPress: handleDeleteAccount,
        },
      ],
    );
  }, [canSubmit, handleDeleteAccount]);

  return (
    <Container noPadding>
      <PageHeader title="회원 탈퇴" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.descriptionSection}>
            <Typography variant="body1" weight="semibold">
              계정을 탈퇴하시겠어요?
            </Typography>
            <Typography color="secondary" variant="body3">
              회원 탈퇴 시 계정 식별 정보와 개인정보가 삭제되며, 진행한 기록은
              복구할 수 없습니다.
            </Typography>
            {isPlainAccount ? (
              <View style={styles.passwordSection}>
                <Typography variant="body3" weight="semibold">
                  현재 비밀번호
                </Typography>
                <PasswordInput
                  accessibilityLabel="현재 비밀번호"
                  autoFocus
                  onChangeText={setPassword}
                  placeholder="현재 비밀번호를 입력해주세요."
                  value={password}
                />
              </View>
            ) : loginType ? (
              <Typography color="secondary" variant="body3">
                소셜 로그인 계정은 비밀번호 확인 없이 탈퇴할 수 있습니다.
              </Typography>
            ) : null}
          </View>
          <Button
            accessibilityLabel="회원 탈퇴 진행"
            disabled={!canSubmit}
            fullWidth
            loading={deleteAccountMutation.isPending}
            onPress={handleConfirm}
            size="lg"
            variant="danger"
          >
            회원 탈퇴
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[8],
    paddingHorizontal: theme.foundation.spacing[4],
    paddingTop: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[8],
  },
  descriptionSection: {
    gap: theme.foundation.spacing[3],
  },
  passwordSection: {
    marginTop: theme.foundation.spacing[3],
    gap: theme.foundation.spacing[2],
  },
}));
