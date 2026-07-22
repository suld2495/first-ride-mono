import type { AppleGender } from '@repo/types';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { setAuthorization, setRefreshToken } from '@/api/token-storage.api';
import AuthForm from '@/components/auth/auth-form';
import { GenderSelector } from '@/components/auth/gender-selector';
import JobOptionSelector from '@/components/auth/job-option-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import {
  useAppleSignUpMutation,
  useJobOptionsQuery,
  useSocialSignUpMutation,
} from '@/hooks/useAuth';
import { useAuthSignIn } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import { usePendingSocialAuth } from '@/hooks/usePendingAppleAuth';
import { AUTH_PROVIDER_NAMES, getDeviceType } from '@/providers/auth/types';
import { baseFoundation } from '@/theme/tokens';
import { getDeviceId } from '@/utils/device-id';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

interface ProfileForm {
  nickname: string;
  job: string;
  gender: AppleGender | '';
}

const initial = (): ProfileForm => ({
  nickname: '',
  job: '',
  gender: '',
});

export default function SocialSignUp() {
  const router = useRouter();
  const completedRef = useRef(false);
  const [form, setForm] = useState<ProfileForm>(initial());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { pushToken } = useNotifications();
  const signIn = useAuthSignIn();
  const socialSignUpMutation = useSocialSignUpMutation();
  const appleSignUpMutation = useAppleSignUpMutation();
  const { attempt, getValidAttempt, clearAttempt, consumeAuthorizationCode } =
    usePendingSocialAuth();
  const {
    data: jobOptions = [],
    isError: isJobOptionsError,
    isLoading: isJobOptionsLoading,
  } = useJobOptionsQuery();
  const { showToast } = useToast();
  const isAttemptValid = !!attempt && attempt.expiresAt > Date.now();
  const provider = isAttemptValid ? attempt.provider : null;
  const isApple = provider === 'apple';

  useEffect(() => {
    if (completedRef.current || isAttemptValid) {
      return;
    }

    clearAttempt(attempt?.id);
    router.replace('/sign-in');
  }, [attempt?.id, clearAttempt, isAttemptValid, router]);

  useEffect(() => {
    const attemptId = attempt?.id;

    if (!attemptId) {
      return;
    }

    return () => {
      if (!completedRef.current) {
        clearAttempt(attemptId);
      }
    };
  }, [attempt?.id, clearAttempt]);

  const getProviderName = () => {
    if (!provider) return 'SNS';
    return AUTH_PROVIDER_NAMES[provider] || 'SNS';
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
    if (isApple && !form.gender) {
      errors.gender = '성별을 선택해주세요.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const currentAttempt = getValidAttempt();

    if (!currentAttempt || currentAttempt.id !== attempt?.id) {
      showToast(
        '소셜 로그인 정보가 만료되었습니다. 다시 로그인해주세요.',
        'error',
      );
      router.replace('/sign-in');
      return;
    }

    try {
      const deviceId = await getDeviceId();
      const deviceInfo = {
        pushToken: pushToken?.data || undefined,
        deviceType: getDeviceType(),
        deviceId,
      };
      const { credential } = currentAttempt;
      const response =
        credential.provider === 'apple'
          ? await appleSignUpMutation.mutateAsync({
              nonceId: credential.nonceId,
              identityToken: credential.identityToken,
              authorizationCode: consumeAuthorizationCode(currentAttempt.id),
              nickname: form.nickname,
              job: form.job,
              gender: form.gender as AppleGender,
              ...deviceInfo,
            })
          : await socialSignUpMutation.mutateAsync({
              provider: credential.provider,
              accessToken: credential.accessToken,
              nickname: form.nickname,
              job: form.job,
              ...deviceInfo,
            });

      await Promise.all([
        setAuthorization(response.accessToken),
        setRefreshToken(response.refreshToken),
      ]);
      completedRef.current = true;
      clearAttempt(currentAttempt.id);
      signIn(response.userInfo);
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

  if (!isAttemptValid) {
    return null;
  }

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
        {isApple ? (
          <GenderSelector
            value={form.gender}
            onSelect={(value) => handleChange('gender', value)}
            error={!!fieldErrors.gender}
            helperText={fieldErrors.gender}
          />
        ) : null}
        <Button
          onPress={handleSubmit}
          style={styles.button}
          loading={
            socialSignUpMutation.isPending || appleSignUpMutation.isPending
          }
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
