import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import AuthForm from '@/components/auth/AuthForm';
import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import ThemeTextInput from '@/components/common/ThemeTextInput';
import ThemeView from '@/components/common/ThemeView';
import { useLoginMutation } from '@repo/shared/hooks/useAuth';
import { AuthForm as AuthFormType } from '@repo/types';
import { setAuthorization } from '@/api';
import { useNotifications } from '@/hooks/useNotifications';

const initial = () => ({
  userId: '',
  password: '',
});

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState<AuthFormType>(initial());
  const login = useLoginMutation();
  const { pushToken } = useNotifications();

  const handleLogin = async () => {
    const isValid = form.userId && form.password;

    if (!isValid) {
      alert('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 로그인 요청 시 푸시 토큰 정보 포함
      const loginData: AuthFormType = {
        ...form,
        pushToken: pushToken?.data,
        deviceType: Platform.OS as 'ios' | 'android',
      };

      const response = await login.mutateAsync(loginData);
      setAuthorization(response.accessToken);
      router.push('/(tabs)/(afterLogin)/(routine)')
    } catch {}
  };

  const handleChange = (key: 'userId' | 'password', value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <ThemeView style={styles.container}>
      <AuthForm title='로그인'>
        <ThemeTextInput 
          width={250} 
          placeholder="아이디를 입력해주세요."
          value={form.userId}
          onChangeText={(value) => handleChange('userId', value)}
        />
        <ThemeTextInput 
          width={250} 
          placeholder="비밀번호를 입력해주세요."
          value={form.password}
          onChangeText={(value) => handleChange('password', value)}
        />
        <Button 
          title="로그인" 
          onPress={handleLogin}
          style={styles.button}
        />
        <Link 
          href="/sign-up"
          variant="plain"
          title='회원가입'
          style={styles.link}
          onPress={() => setForm(initial())}
        />
      </AuthForm>
    </ThemeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    marginTop: 10
  },

  link: {
    alignItems: 'flex-end'
  }
});