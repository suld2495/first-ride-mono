import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { JoinForm as JoinFormType } from '@repo/types';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Link from '@/components/common/Link';
import PasswordInput from '@/components/common/PasswordInput';
import ThemeView from '@/components/common/ThemeView';
import { useJoinMutation } from '@/hooks/useAuth';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

const initial = () => ({
  userId: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
  job: '',
});

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState<
    JoinFormType & { passwordConfirm: JoinFormType['password'] }
  >(initial());
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const join = useJoinMutation();

  const handleJoin = async () => {
    setFieldErrors({});

    // 클라이언트 측 유효성 검사
    const errors: Record<string, string> = {};

    if (!form.userId) {
      errors.userId = '아이디를 입력해주세요.';
    }
    if (!form.nickname) {
      errors.nickname = '닉네임을 입력해주세요.';
    }
    if (!form.password) {
      errors.password = '비밀번호를 입력해주세요.';
    }
    if (!form.passwordConfirm) {
      errors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (form.passwordConfirm !== form.password) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await join.mutateAsync(form);
      router.push('/sign-in');
    } catch (error) {
      const serverErrors = getFieldErrors(error);

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else {
        const errorMessage = getApiErrorMessage(
          error,
          '회원가입에 실패했습니다. 다시 시도해주세요.',
        );

        setFieldErrors({ password: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    key: keyof JoinFormType | 'passwordConfirm',
    value: string,
  ) => {
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
      <AuthForm title="회원가입">
        <Input
          placeholder="아이디를 입력해주세요."
          value={form.userId}
          onChangeText={(value) => handleChange('userId', value)}
          style={{ width: 250 }}
          error={!!fieldErrors.userId}
          helperText={fieldErrors.userId}
        />
        <Input
          placeholder="닉네임을 입력해주세요."
          value={form.nickname}
          onChangeText={(value) => handleChange('nickname', value)}
          style={{ width: 250 }}
          error={!!fieldErrors.nickname}
          helperText={fieldErrors.nickname}
        />
        <PasswordInput
          width={250}
          placeholder="비밀번호를 입력해주세요."
          value={form.password}
          onChangeText={(value) => handleChange('password', value)}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password}
        />
        <PasswordInput
          width={250}
          placeholder="비밀번호를 다시 입력해주세요."
          value={form.passwordConfirm}
          onChangeText={(value) => handleChange('passwordConfirm', value)}
          error={!!fieldErrors.passwordConfirm}
          helperText={fieldErrors.passwordConfirm}
        />
        <Input
          placeholder="직업을 입력해주세요."
          value={form.job}
          onChangeText={(value) => handleChange('job', value)}
          style={{ width: 250 }}
          error={!!fieldErrors.job}
          helperText={fieldErrors.job}
        />
        <Button
          title="회원가입"
          onPress={handleJoin}
          style={styles.button}
          loading={isLoading}
        />
        <Link
          href="/sign-in"
          variant="ghost"
          title="로그인"
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
