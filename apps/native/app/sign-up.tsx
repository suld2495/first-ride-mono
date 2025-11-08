import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useJoinMutation } from '@repo/shared/hooks/useAuth';
import { JoinForm as JoinFormType } from '@repo/types';
import { useRouter } from 'expo-router';

import AuthForm from '@/components/auth/AuthForm';
import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import PasswordInput from '@/components/common/PasswordInput';
import ThemeTextInput from '@/components/common/ThemeTextInput';
import ThemeView from '@/components/common/ThemeView';

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

    try {
      await join.mutateAsync(form);
      router.push('/sign-in');
    } catch {}
  };

  const handleChange = (
    key: keyof JoinFormType | 'passwordConfirm',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <ThemeView style={styles.container}>
      <AuthForm title="회원가입">
        <ThemeTextInput
          width={250}
          placeholder="아이디를 입력해주세요."
          value={form.userId}
          onChangeText={(value) => handleChange('userId', value)}
        />
        <ThemeTextInput
          width={250}
          placeholder="닉네임을 입력해주세요."
          value={form.nickname}
          onChangeText={(value) => handleChange('nickname', value)}
        />
        <PasswordInput
          width={250}
          placeholder="비밀번호를 입력해주세요."
          value={form.password}
          onChangeText={(value) => handleChange('password', value)}
        />
        <PasswordInput
          width={250}
          placeholder="비밀번호를 다시 입력해주세요."
          value={form.passwordConfirm}
          onChangeText={(value) => handleChange('passwordConfirm', value)}
        />
        <ThemeTextInput
          width={250}
          placeholder="직업을 입력해주세요."
          value={form.job}
          onChangeText={(value) => handleChange('job', value)}
        />
        <Button title="회원가입" onPress={handleJoin} style={styles.button} />
        <Link
          href="/sign-in"
          variant="plain"
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
