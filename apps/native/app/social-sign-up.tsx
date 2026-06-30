import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { setAuthorization, setRefreshToken } from '@/api/token-storage.api';
import AuthForm from '@/components/auth/auth-form';
import JobOptionSelector from '@/components/auth/job-option-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useJobOptionsQuery, useSocialSignUpMutation } from '@/hooks/useAuth';
import { useAuthSignIn } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import {
  AUTH_PROVIDER_NAMES,
  getDeviceType,
  type SocialProviderType,
} from '@/providers/auth/types';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';
import { pushAfterProtectedRoutesReady } from '@/utils/protected-route-navigation';

interface ProfileForm {
  nickname: string;
  job: string;
}

const initial = (): ProfileForm => ({
  nickname: '',
  job: '',
});

export default function SocialSignUp() {
  const router = useRouter();
  const { provider, accessToken } = useLocalSearchParams<{
    provider: string;
    accessToken: string;
  }>();
  const [form, setForm] = useState<ProfileForm>(initial());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { pushToken } = useNotifications();
  const signIn = useAuthSignIn();
  const socialSignUpMutation = useSocialSignUpMutation();
  const {
    data: jobOptions = [],
    isError: isJobOptionsError,
    isLoading: isJobOptionsLoading,
  } = useJobOptionsQuery();
  const { showToast } = useToast();

  const getProviderName = () => {
    if (!provider) return 'SNS';
    return AUTH_PROVIDER_NAMES[provider as SocialProviderType] || 'SNS';
  };

  const handleSubmit = async () => {
    setFieldErrors({});

    // 클라이언트 측 유효성 검사
    const errors: Record<string, string> = {};

    if (!form.nickname) {
      errors.nickname = '닉네임을 입력해주세요.';
    }
    if (!form.job) {
      errors.job = '직업을 선택해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const response = await socialSignUpMutation.mutateAsync({
        provider: provider as SocialProviderType,
        accessToken,
        nickname: form.nickname,
        job: form.job,
        pushToken: pushToken?.data,
        deviceType: getDeviceType(),
      });

      await Promise.all([
        setAuthorization(response.accessToken),
        setRefreshToken(response.refreshToken),
      ]);
      signIn(response.userInfo);

      await pushAfterProtectedRoutesReady(
        router,
        '/(tabs)/(afterLogin)/(routine)',
      );
    } catch (error) {
      const serverErrors = getFieldErrors(error);

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);
      } else {
        const errorMessage = getApiErrorMessage(
          error,
          '프로필 등록에 실패했습니다. 다시 시도해주세요.',
        );

        showToast(errorMessage, 'error');
      }
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
        <Typography
          variant="label"
          weight="semibold"
          color="secondary"
          style={styles.description}
        >
          {getProviderName()} 계정으로 가입합니다.{'\n'}
          추가 정보를 입력해주세요.
        </Typography>

        <Input
          placeholder="닉네임을 입력해주세요."
          value={form.nickname}
          onChangeText={(value) => handleChange('nickname', value)}
          style={{ width: baseFoundation.dimension.x250 }}
          error={!!fieldErrors.nickname}
          helperText={fieldErrors.nickname}
        />
        <JobOptionSelector
          options={jobOptions}
          value={form.job}
          onSelect={(value) => handleChange('job', value)}
          error={!!fieldErrors.job}
          helperText={
            fieldErrors.job ||
            (isJobOptionsError ? '직업 목록을 불러오지 못했습니다.' : undefined)
          }
          isLoading={isJobOptionsLoading}
        />
        <Button
          onPress={handleSubmit}
          style={styles.button}
          loading={socialSignUpMutation.isPending}
        >
          가입 완료
        </Button>
      </AuthForm>
    </ThemeView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: baseFoundation.dimension.x10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  description: {
    textAlign: 'center',
    marginBottom: theme.foundation.spacing[2],
  },

  button: {
    marginTop: theme.foundation.spacing[2],
  },
}));
