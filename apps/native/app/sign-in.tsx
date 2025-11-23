import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { ApiError } from '@repo/shared/api/AppError';
import { useLoginMutation } from '@repo/shared/hooks/useAuth';
import { AuthForm as AuthFormType } from '@repo/types';
import { useRouter } from 'expo-router';

import { setAuthorization } from '@/api';
import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Link from '@/components/common/Link';
import PasswordInput from '@/components/common/PasswordInput';
import ThemeView from '@/components/common/ThemeView';
import { useNotifications } from '@/hooks/useNotifications';

const initial = () => ({
  userId: '',
  password: '',
});

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState<AuthFormType>(initial());
  const login = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const { pushToken } = useNotifications();

  const handleLogin = async () => {
    const isValid = form.userId && form.password;

    if (!isValid) {
      alert('아이디 또는 비밀번호를 입력해주세요.');
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

      const response = await login.mutateAsync(loginData);

      setAuthorization(response.accessToken);
      router.push('/(tabs)/(afterLogin)/(routine)');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : '로그인에 실패했습니다. 다시 시도해주세요.';

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: 'userId' | 'password', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <ThemeView style={styles.container}>
      <AuthForm title="로그인">
        <Input
          placeholder="아이디를 입력해주세요."
          value={form.userId}
          onChangeText={(value) => handleChange('userId', value)}
          style={{ width: 250 }}
        />
        <PasswordInput
          width={250}
          placeholder="비밀번호를 입력해주세요."
          value={form.password}
          onChangeText={(value) => handleChange('password', value)}
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
});
