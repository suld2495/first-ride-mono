import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { AuthForm as AuthFormType } from '@repo/types';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/auth/AuthForm';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Link from '@/components/common/Link';
import PasswordInput from '@/components/common/PasswordInput';
import ThemeView from '@/components/common/ThemeView';
import { useLoginMutation } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

const initial = () => ({
  userId: '',
  password: '',
});

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState<AuthFormType>(initial());
  const login = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { pushToken } = useNotifications();
  const { login: socialLogin, isLoading: isSocialLoading } = useSocialAuth();

  const handleKakaoLogin = async () => {
    try {
      await socialLogin('kakao');
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        '카카오 로그인에 실패했습니다. 다시 시도해주세요.',
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

    setIsLoading(true);
    try {
      // 로그인 요청 시 푸시 토큰 정보 포함
      const loginData: AuthFormType = {
        ...form,
        pushToken: pushToken?.data,
        deviceType: Platform.OS as 'ios' | 'android',
      };

      await login.mutateAsync(loginData);
      router.push('/(tabs)/(afterLogin)/(routine)');
    } catch (error) {
      const serverErrors = getFieldErrors(error);

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else {
        const errorMessage = getApiErrorMessage(
          error,
          '로그인에 실패했습니다. 다시 시도해주세요.',
        );

        setFieldErrors({ password: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
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
          loading={isLoading}
        />
        <Link
          href="/sign-up"
          variant="ghost"
          title="회원가입"
          style={styles.link}
          onPress={() => setForm(initial())}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <KakaoLoginButton
          onPress={handleKakaoLogin}
          loading={isSocialLoading}
          disabled={isLoading}
          style={styles.kakaoButton}
        />
      </AuthForm>
    </ThemeView>
  );
}

const styles = StyleSheet.create((theme) => ({
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

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 250,
    marginVertical: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.default,
  },

  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: theme.colors.text.tertiary,
  },

  kakaoButton: {
    width: 250,
  },
}));
