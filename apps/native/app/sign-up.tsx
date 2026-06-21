import {
  checkEmailAvailability,
  requestEmailVerification,
} from '@repo/shared/api';
import type { JoinForm as JoinFormType } from '@repo/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import AuthPage from '@/components/auth/auth-page';
import JobOptionSelector from '@/components/auth/job-option-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasswordInput from '@/components/ui/password-input';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useJobOptionsQuery } from '@/hooks/useAuth';
import { useSetPendingSignUpPayload } from '@/hooks/usePendingSignUp';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

type SignUpStep = 'basic' | 'job';

const FORM_WIDTH = '100%';
const USER_ID_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ID_MAX_LENGTH = 100;
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 10;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 15;
const MIN_NEXT_LOADING_MS = 300;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const initial = () => ({
  userId: '',
  nickname: '',
  password: '',
  passwordConfirm: '',
  job: '',
});

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState<SignUpStep>('basic');
  const [form, setForm] = useState<
    JoinFormType & { passwordConfirm: JoinFormType['password'] }
  >(initial());
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUserId, setIsCheckingUserId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const setPendingSignUpPayload = useSetPendingSignUpPayload();
  const {
    data: jobOptions = [],
    isError: isJobOptionsError,
    isLoading: isJobOptionsLoading,
  } = useJobOptionsQuery();

  const getJoinPayload = (): JoinFormType => ({
    userId: form.userId.trim(),
    nickname: form.nickname.trim(),
    password: form.password,
    job: form.job,
  });

  const validateBasicFields = () => {
    const errors: Record<string, string> = {};
    const {
      nickname: rawNickname,
      password,
      passwordConfirm,
      userId: rawUserId,
    } = form;
    const userId = rawUserId.trim();
    const nickname = rawNickname.trim();

    if (!userId) {
      errors.userId = '아이디를 입력해주세요.';
    } else if (!USER_ID_EMAIL_PATTERN.test(userId)) {
      errors.userId = '아이디는 이메일 형식이어야 합니다.';
    } else if (userId.length > USER_ID_MAX_LENGTH) {
      errors.userId = `아이디는 ${USER_ID_MAX_LENGTH}자 이하로 입력해주세요.`;
    }

    if (!nickname) {
      errors.nickname = '닉네임을 입력해주세요.';
    } else if (
      nickname.length < NICKNAME_MIN_LENGTH ||
      nickname.length > NICKNAME_MAX_LENGTH
    ) {
      errors.nickname = `닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자로 입력해주세요.`;
    }

    if (!password.trim()) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      errors.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자로 입력해주세요.`;
    }

    if (!passwordConfirm.trim()) {
      errors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (passwordConfirm !== password) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    return errors;
  };

  const getEmailFieldErrors = (error: unknown): Record<string, string> => {
    const serverErrors = getFieldErrors(error);
    const { email, ...restServerErrors } = serverErrors;

    return {
      ...restServerErrors,
      ...(email ? { userId: email } : {}),
    };
  };

  const getUserIdCheckErrors = (error: unknown) => {
    const normalizedServerErrors = getEmailFieldErrors(error);

    if (Object.keys(normalizedServerErrors).length > 0) {
      return normalizedServerErrors;
    }

    return {
      userId: getApiErrorMessage(
        error,
        '이메일 확인에 실패했습니다. 다시 시도해주세요.',
      ),
    };
  };

  const handleNext = async () => {
    const errors = validateBasicFields();

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const minLoading = wait(MIN_NEXT_LOADING_MS);

    setIsCheckingUserId(true);
    try {
      const availability = await checkEmailAvailability(form.userId.trim());

      await minLoading;

      if (!availability.available) {
        setFieldErrors({ userId: '이미 사용 중인 아이디입니다.' });
        return;
      }

      setFieldErrors({});
      setStep('job');
    } catch (error) {
      await minLoading;
      setFieldErrors(getUserIdCheckErrors(error));
    } finally {
      setIsCheckingUserId(false);
    }
  };

  const handleJoin = async () => {
    const errors = validateBasicFields();

    if (!form.job) {
      errors.job = '직업을 선택해주세요.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (
        errors.userId ||
        errors.nickname ||
        errors.password ||
        errors.passwordConfirm
      ) {
        setStep('basic');
      }

      return;
    }

    setIsLoading(true);
    try {
      const payload = getJoinPayload();

      await requestEmailVerification(payload.userId);
      setPendingSignUpPayload(payload);
      router.push('/sign-up-email-verification');
    } catch (error) {
      const serverErrors = getEmailFieldErrors(error);

      if (Object.keys(serverErrors).length > 0) {
        setFieldErrors(serverErrors);

        if (
          serverErrors.userId ||
          serverErrors.nickname ||
          serverErrors.password ||
          serverErrors.passwordConfirm
        ) {
          setStep('basic');
        }
      } else {
        const errorMessage = getApiErrorMessage(
          error,
          '회원가입에 실패했습니다. 다시 시도해주세요.',
        );

        setStep('basic');
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

  const handleSignInPress = () => {
    setForm(initial());
    router.push('/sign-in');
  };

  const isJobStep = step === 'job';
  const isBasicFieldsIncomplete =
    !form.userId.trim() ||
    !form.nickname.trim() ||
    !form.password.trim() ||
    !form.passwordConfirm.trim();
  const isNextDisabled =
    !isJobStep && (isBasicFieldsIncomplete || isCheckingUserId);

  return (
    <AuthPage contentStyle={isJobStep ? styles.jobPageContent : undefined}>
      <AuthPage.Header title={step === 'basic' ? '회원가입' : '캐릭터 선택'} />

      <AuthPage.Body>
        {step === 'basic' ? (
          <View style={styles.basicFields}>
            <View style={styles.formItem}>
              <Typography variant="body2" style={styles.fieldLabel}>
                아이디
              </Typography>
              <Input
                placeholder="아이디를 입력하세요"
                value={form.userId}
                onChangeText={(value) => handleChange('userId', value)}
                style={styles.input}
                inputStyle={styles.inputText}
                placeholderTextColor={palette.theme.gray[10]}
                autoCapitalize="none"
                keyboardType="email-address"
                error={!!fieldErrors.userId}
                helperText={fieldErrors.userId}
              />
            </View>

            <View style={styles.formItem}>
              <Typography variant="body2" style={styles.fieldLabel}>
                닉네임
              </Typography>
              <Input
                placeholder="닉네임을 입력하세요"
                value={form.nickname}
                onChangeText={(value) => handleChange('nickname', value)}
                style={styles.input}
                inputStyle={styles.inputText}
                placeholderTextColor={palette.theme.gray[10]}
                error={!!fieldErrors.nickname}
                helperText={fieldErrors.nickname}
              />
            </View>

            <View style={styles.formItem}>
              <Typography variant="body2" style={styles.fieldLabel}>
                비밀번호
              </Typography>
              <View style={styles.passwordInputs}>
                <PasswordInput
                  width={FORM_WIDTH}
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChangeText={(value) => handleChange('password', value)}
                  style={styles.input}
                  inputStyle={styles.inputText}
                  placeholderTextColor={palette.theme.gray[10]}
                  iconColor={palette.theme.blue[30]}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                />
                <PasswordInput
                  width={FORM_WIDTH}
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  value={form.passwordConfirm}
                  onChangeText={(value) =>
                    handleChange('passwordConfirm', value)
                  }
                  style={styles.input}
                  inputStyle={styles.inputText}
                  placeholderTextColor={palette.theme.gray[10]}
                  iconColor={palette.theme.blue[30]}
                  error={!!fieldErrors.passwordConfirm}
                  helperText={fieldErrors.passwordConfirm}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.jobFields}>
            <JobOptionSelector
              options={jobOptions}
              value={form.job}
              onSelect={(value) => handleChange('job', value)}
              error={!!fieldErrors.job}
              helperText={
                fieldErrors.job ||
                (isJobOptionsError
                  ? '직업 목록을 불러오지 못했습니다.'
                  : undefined)
              }
              isLoading={isJobOptionsLoading}
            />
          </View>
        )}

        <View style={[styles.actions, isJobStep ? styles.jobActions : null]}>
          <Button
            testID="sign-up-submit-button"
            title={step === 'basic' ? '다음' : '가입'}
            onPress={step === 'basic' ? handleNext : handleJoin}
            style={[
              styles.button,
              !isJobStep && isBasicFieldsIncomplete
                ? styles.buttonDisabled
                : null,
            ]}
            textStyle={styles.primaryButtonText}
            textColor={palette.white}
            loading={step === 'basic' ? isCheckingUserId : isLoading}
            disabled={isNextDisabled}
            fullWidth
            backgroundColor={
              !isJobStep && isBasicFieldsIncomplete
                ? palette.theme.gray[10]
                : palette.theme.blue[50]
            }
          />
          {step === 'basic' ? (
            <Button
              variant="ghost"
              title="로그인하기"
              style={styles.link}
              textStyle={styles.loginButtonText}
              textColor={palette.theme.gray[90]}
              onPress={handleSignInPress}
            />
          ) : null}
        </View>
      </AuthPage.Body>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  basicFields: {
    width: FORM_WIDTH,
    gap: theme.foundation.spacing[5],
    marginTop: baseFoundation.dimension.x120,
  },

  jobPageContent: {
    paddingHorizontal: 0,
  },

  jobFields: {
    width: '100%',
    alignItems: 'center',
    marginTop: baseFoundation.dimension.x80,
  },

  input: {
    width: FORM_WIDTH,
    height: baseFoundation.dimension.x44,
    borderWidth: 0,
    borderRadius: theme.foundation.radii.xs,
    backgroundColor: palette.white,
  },

  inputText: {
    color: palette.theme.gray[70],
    fontSize: theme.foundation.typography.size.body1,
  },

  formItem: {
    gap: theme.foundation.spacing[1],
  },

  passwordInputs: {
    gap: theme.foundation.spacing[1.5],
  },

  fieldLabel: {
    color: palette.theme.gray[70],
  },

  button: {
    height: baseFoundation.dimension.x44,
    borderRadius: theme.foundation.radii.xs,
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonDisabled: {
    opacity: 1,
  },

  primaryButtonText: {
    fontSize: theme.foundation.typography.size.body1,
  },

  link: {
    width: FORM_WIDTH,
    height: baseFoundation.dimension.x44,
    shadowOpacity: 0,
    elevation: 0,
  },

  loginButtonText: {
    fontSize: theme.foundation.typography.size.body1,
    fontWeight: theme.foundation.typography.weight.regular,
  },

  actions: {
    width: FORM_WIDTH,
    gap: theme.foundation.spacing[3],
    marginTop: 'auto',
  },

  jobActions: {
    paddingHorizontal: theme.foundation.spacing[8],
  },
}));
