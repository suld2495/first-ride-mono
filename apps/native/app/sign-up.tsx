import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useJoinMutation } from '@repo/shared/hooks/useAuth';
import { JoinForm as JoinFormType } from '@repo/types';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import Link from '@/components/common/Link';
import PasswordInput from '@/components/common/PasswordInput';
import ThemeView from '@/components/common/ThemeView';
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
    const isValid = form.userId && form.nickname && form.password;

    if (!isValid) {
      alert('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    if (form.passwordConfirm !== form.password) {
      alert('비밀번호가 다릅니다.');
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    try {
      await join.mutateAsync(form);
      alert('회원가입이 완료되었습니다.');
      router.push('/sign-in');
    } catch (error) {
      const errors = getFieldErrors(error);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        const errorMessage = getApiErrorMessage(
          error,
          '회원가입에 실패했습니다. 다시 시도해주세요.',
        );

        alert(errorMessage);
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
