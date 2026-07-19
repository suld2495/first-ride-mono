import type { AuthForm as AuthFormType } from '@repo/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import AuthPage from '@/components/auth/auth-page';
import { KakaoLoginButton } from '@/components/auth/kakao-login-button';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Input } from '@/components/ui/input';
import Link from '@/components/ui/link';
import PasswordInput from '@/components/ui/password-input';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/hooks/useAuth';
import type { CredentialsParams } from '@/providers/auth/credentials.provider';
import type {
  AuthProviderType,
  SocialProviderType,
} from '@/providers/auth/types';
import { AUTH_PROVIDER_NAMES } from '@/providers/auth/types';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

const FORM_WIDTH = '100%';

const initial = () => ({
  userId: '',
  password: '',
});

// 필드 에러를 전달하기 위한 커스텀 에러
class FieldError extends Error {
  constructor(public fieldErrors: Record<string, string>) {
    super('Field validation error');
  }
}

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState<AuthFormType>(initial());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login, loadingProvider } = useAuth();
  const { showToast } = useToast();

  const handleAuth = async (
    providerType: AuthProviderType,
    params?: CredentialsParams,
  ) => {
    try {
      await (providerType === 'credentials'
        ? login('credentials', params!)
        : login(providerType));
    } catch (error) {
      // 필드 에러가 있으면 throw해서 caller가 처리하도록
      const serverErrors = getFieldErrors(error);

      if (Object.keys(serverErrors).length > 0) {
        throw new FieldError(serverErrors);
      }

      // 일반 에러는 여기서 처리
      const providerName = AUTH_PROVIDER_NAMES[providerType];
      const errorMessage = getApiErrorMessage(
        error,
        `${providerName} 로그인에 실패했습니다. 다시 시도해주세요.`,
      );

      showToast(errorMessage, 'error');
    }
  };

  const handleLogin = async () => {
    setFieldErrors({});

    // 클라이언트 측 유효성 검사
    const errors: Record<string, string> = {};

    if (!form.userId) {
      errors.userId = '이메일을 입력해주세요.';
    }
    if (!form.password) {
      errors.password = '비밀번호를 입력해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await handleAuth('credentials', {
        userId: form.userId,
        password: form.password,
      });
    } catch (error) {
      if (error instanceof FieldError) {
        setFieldErrors(error.fieldErrors);
      }
    }
  };

  const handleSocialLogin = (providerType: SocialProviderType) => {
    handleAuth(providerType);
  };

  const handleChange = (key: 'userId' | 'password', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const { [key]: _, ...rest } = prev;

        return rest;
      });
    }
  };

  const isLoading = loadingProvider !== null;
  const isCredentialsIncomplete = !form.userId.trim() || !form.password.trim();
  const isLoginDisabled =
    isCredentialsIncomplete || (isLoading && loadingProvider !== 'credentials');

  return (
    <AuthPage>
      <AuthPage.Header title="로그인" />

      <AuthPage.Body>
        <View style={styles.form}>
          <View style={styles.formItem}>
            <Typography variant="caption1" style={styles.fieldLabel}>
              이메일
            </Typography>
            <Input
              placeholder="이메일을 입력하세요"
              value={form.userId}
              onChangeText={(value) => handleChange('userId', value)}
              style={styles.input}
              inputStyle={styles.inputText}
              placeholderTextColor={palette.theme.gray[10]}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!fieldErrors.userId}
              helperText={fieldErrors.userId}
            />
          </View>

          <View style={styles.formItem}>
            <Typography variant="caption1" style={styles.fieldLabel}>
              비밀번호
            </Typography>
            <PasswordInput
              width={FORM_WIDTH}
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChangeText={(value) => handleChange('password', value)}
              style={styles.input}
              inputStyle={styles.inputText}
              placeholderTextColor={palette.theme.gray[10]}
              iconColor={palette.theme.blue[30]}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            testID="sign-in-submit-button"
            title="로그인"
            onPress={handleLogin}
            style={[
              styles.button,
              isCredentialsIncomplete ? styles.buttonDisabled : null,
            ]}
            textStyle={styles.primaryButtonText}
            textColor={palette.white}
            loading={loadingProvider === 'credentials'}
            disabled={isLoginDisabled}
            fullWidth
            backgroundColor={
              isCredentialsIncomplete
                ? palette.theme.gray[10]
                : palette.theme.blue[50]
            }
          />

          <View style={styles.divider}>
            <Divider
              text="또는"
              lineColor={palette.theme.gray[10]}
              textColor={palette.theme.softBlue[60]}
              textStyle={styles.dividerText}
            />
          </View>

          <KakaoLoginButton
            onPress={() => handleSocialLogin('kakao')}
            loading={loadingProvider === 'kakao'}
            disabled={isLoading && loadingProvider !== 'kakao'}
            style={styles.kakaoButton}
          />

          <View style={styles.footerLinks}>
            <View style={styles.accountLinks}>
              <Link
                href="/sign-up"
                variant="ghost"
                title="회원가입"
                style={styles.footerLink}
                textStyle={styles.accountLinkText}
                textColor={palette.theme.gray[90]}
                onPress={() => setForm(initial())}
              />
              <Button
                variant="ghost"
                title="비밀번호 재설정"
                style={styles.footerLink}
                textStyle={styles.accountLinkText}
                textColor={palette.theme.gray[90]}
              />
            </View>

            <View style={styles.policyLinks}>
              <Button
                accessibilityRole="link"
                variant="ghost"
                title="이용약관"
                onPress={() => router.push('/modal?type=policies')}
                style={styles.policyLink}
                textStyle={styles.policyLinkText}
                textColor={palette.theme.gray[15]}
              />
              <Button
                accessibilityRole="link"
                variant="ghost"
                title="개인정보 처리방침"
                onPress={() => router.push('/modal?type=privacy')}
                style={styles.policyLink}
                textStyle={styles.policyLinkText}
                textColor={palette.theme.gray[15]}
              />
            </View>
          </View>
        </View>
      </AuthPage.Body>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  form: {
    width: FORM_WIDTH,
    gap: theme.foundation.spacing[5],
    marginTop: baseFoundation.dimension.x96,
  },

  formItem: {
    gap: theme.foundation.spacing[1],
  },

  fieldLabel: {
    color: palette.theme.gray[70],
  },

  input: {
    width: FORM_WIDTH,
    height: baseFoundation.dimension.x44,
    borderWidth: 0,
    borderRadius: theme.foundation.radii.xs,
    backgroundColor: palette.white,
  },

  inputText: {
    color: palette.theme.gray[70],
    fontSize: theme.foundation.typography.size.body1,
  },

  actions: {
    width: FORM_WIDTH,
    marginTop: 46,
  },

  button: {
    height: baseFoundation.dimension.x44,
    borderRadius: theme.foundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonDisabled: {
    opacity: 1,
  },

  primaryButtonText: {
    fontSize: theme.foundation.typography.size.body1,
  },

  divider: {
    marginTop: 48,
    marginBottom: 20,
    width: FORM_WIDTH,
  },

  dividerText: {
    fontSize: theme.foundation.typography.size.body3,
    fontWeight: theme.foundation.typography.weight.semibold,
  },

  footerLink: {
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[2],
    shadowOpacity: 0,
    elevation: 0,
  },

  accountLinkText: {
    fontSize: theme.foundation.typography.size.body2,
    fontWeight: theme.foundation.typography.weight.regular,
    color: palette.theme.gray[90],
  },

  kakaoButton: {
    width: FORM_WIDTH,
  },

  footerLinks: {
    alignItems: 'center',
    gap: theme.foundation.spacing[1],
    marginTop: theme.foundation.spacing[7],
  },

  accountLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[12],
  },

  policyLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[5],
  },

  policyLink: {
    height: 'auto',
    paddingHorizontal: theme.foundation.spacing[2],
    paddingVertical: 9,
    shadowOpacity: 0,
    elevation: 0,
  },

  policyLinkText: {
    fontSize: theme.foundation.typography.size.caption1,
    fontWeight: theme.foundation.typography.weight.medium,
    color: palette.theme.gray[15],
  },
}));
