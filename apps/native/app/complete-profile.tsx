import { useState } from 'react';
import { Platform, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { completeProfile } from '@repo/shared/api/social-auth.api';
import { useLocalSearchParams, useRouter } from 'expo-router';

import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import ThemeView from '@/components/common/ThemeView';
import { useNotifications } from '@/hooks/useNotifications';
import { setAuthorization, setRefreshToken } from '@/api';
import { useAuthStore } from '@/store/auth.store';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

interface ProfileForm {
  nickname: string;
  job: string;
}

const initial = (): ProfileForm => ({
  nickname: '',
  job: '',
});

export default function CompleteProfile() {
  const router = useRouter();
  const { tempToken, provider } = useLocalSearchParams<{
    tempToken: string;
    provider: string;
  }>();
  const [form, setForm] = useState<ProfileForm>(initial());
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { pushToken } = useNotifications();
  const { signIn } = useAuthStore();

  const getProviderName = () => {
    switch (provider) {
      case 'kakao':
        return '카카오';
      case 'apple':
        return 'Apple';
      case 'google':
        return 'Google';
      default:
        return 'SNS';
    }
  };

  const handleSubmit = async () => {
    setFieldErrors({});

    // 클라이언트 측 유효성 검사
    const errors: Record<string, string> = {};

    if (!form.nickname) {
      errors.nickname = '닉네임을 입력해주세요.';
    }
    if (!form.job) {
      errors.job = '직업을 입력해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!tempToken) {
      setFieldErrors({ nickname: '잘못된 접근입니다. 다시 로그인해주세요.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await completeProfile({
        tempToken,
        nickname: form.nickname,
        job: form.job,
        pushToken: pushToken?.data,
        deviceType: Platform.OS as 'ios' | 'android',
      });

      // 로그인 완료 처리
      signIn(response.userInfo);
      await Promise.all([
        setAuthorization(response.accessToken),
        setRefreshToken(response.refreshToken),
      ]);

      router.push('/(tabs)/(afterLogin)/(routine)');
    } catch (error) {
      const serverErrors = getFieldErrors(error);

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else {
        const errorMessage = getApiErrorMessage(
          error,
          '프로필 등록에 실패했습니다. 다시 시도해주세요.',
        );

        setFieldErrors({ nickname: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: keyof ProfileForm, value: string) => {
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
      <AuthForm title="추가 정보 입력">
        <Text style={styles.description}>
          {getProviderName()} 계정으로 가입합니다.{'\n'}
          추가 정보를 입력해주세요.
        </Text>

        <Input
          placeholder="닉네임을 입력해주세요."
          value={form.nickname}
          onChangeText={(value) => handleChange('nickname', value)}
          style={{ width: 250 }}
          error={!!fieldErrors.nickname}
          helperText={fieldErrors.nickname}
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
          title="가입 완료"
          onPress={handleSubmit}
          style={styles.button}
          loading={isLoading}
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

  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },

  button: {
    marginTop: 10,
  },
}));
