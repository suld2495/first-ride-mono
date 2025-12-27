import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { AuthForm as AuthFormType } from '@repo/types';

import AuthForm from '@/components/auth/AuthForm';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';
import { Button } from '@/components/common/Button';
import { Divider } from '@/components/common/Divider';
import { Input } from '@/components/common/Input';
import Link from '@/components/common/Link';
import PasswordInput from '@/components/common/PasswordInput';
import ThemeView from '@/components/common/ThemeView';
import { useAuth } from '@/hooks/useAuth';
import {
  AUTH_PROVIDER_NAMES,
  AuthProviderType,
  CredentialsParams,
  SocialProviderType,
} from '@/providers/auth';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

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
  const [form, setForm] = useState<AuthFormType>(initial());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login, loadingProvider } = useAuth();

  const handleAuth = async (
    providerType: AuthProviderType,
    params?: CredentialsParams,
  ) => {
    try {
      if (providerType === 'credentials') {
        await login('credentials', params!);
      } else {
        await login(providerType);
      }
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
      setFieldErrors({ password: errorMessage });
    }
  };

  const handleLogin = async () => {
    setFieldErrors({});

    // 클라이언트 측 유효성 검사
    const errors: Record<string, string> = {};

    if (!form.userId) {
      errors.userId = '아이디를 입력해주세요.';
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

  return (
    <ThemeView style={styles.container}>
      <AuthForm title="로그인">
        <Input
          placeholder="아이디를 입력해주세요."
          value={form.userId}
          onChangeText={(value) => handleChange('userId', value)}
          style={{ width: 250 }}
          error={!!fieldErrors.userId}
          helperText={fieldErrors.userId}
        />
        <PasswordInput
          width={250}
          placeholder="비밀번호를 입력해주세요."
          value={form.password}
          onChangeText={(value) => handleChange('password', value)}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
        />
        <Button
          title="로그인"
          onPress={handleLogin}
          style={styles.button}
          loading={loadingProvider === 'credentials'}
          disabled={isLoading && loadingProvider !== 'credentials'}
        />
        <Link
          href="/sign-up"
          variant="ghost"
          title="회원가입"
          style={styles.link}
          onPress={() => setForm(initial())}
        />

        <Divider text="또는" spacing={16} />

        <KakaoLoginButton
          onPress={() => handleSocialLogin('kakao')}
          loading={loadingProvider === 'kakao'}
          disabled={isLoading && loadingProvider !== 'kakao'}
          style={styles.kakaoButton}
        />
      </AuthForm>
    </ThemeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    marginTop: 10,
  },

  link: {
    alignItems: 'flex-end',
  },

  kakaoButton: {
    width: 250,
  },
});
