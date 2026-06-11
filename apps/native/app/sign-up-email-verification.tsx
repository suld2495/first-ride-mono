import {
  confirmEmailVerification,
  join as signUpWithEmail,
} from '@repo/shared/api';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import AuthPage from '@/components/auth/auth-page';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import {
  useClearPendingSignUpPayload,
  usePendingSignUpPayload,
} from '@/hooks/usePendingSignUp';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const EMAIL_VERIFICATION_POLL_INTERVAL_MS = 2500;
const EMAIL_VERIFICATION_MAX_WAIT_MS = 30 * 60 * 1000;

type VerificationStatus = 'waiting' | 'verified' | 'expired' | 'error';

export default function SignUpEmailVerification() {
  const router = useRouter();
  const payload = usePendingSignUpPayload();
  const clearPayload = useClearPendingSignUpPayload();
  const [status, setStatus] = useState<VerificationStatus>('waiting');
  const [message, setMessage] = useState(
    '이메일로 보낸 인증 링크를 클릭해주세요',
  );
  const isCompletingRef = useRef(false);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!payload) {
      if (!isLeavingRef.current) {
        router.replace('/sign-up');
      }
      return undefined;
    }

    let isActive = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let expireTimer: ReturnType<typeof setTimeout> | null = null;

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (expireTimer) {
        clearTimeout(expireTimer);
        expireTimer = null;
      }
    };

    const completeSignUp = async () => {
      if (isCompletingRef.current) {
        return;
      }

      isCompletingRef.current = true;
      stopPolling();
      setStatus('verified');
      setMessage('이메일 인증이 완료되었습니다.');

      try {
        await signUpWithEmail(payload);
        if (!isActive) {
          return;
        }
        isLeavingRef.current = true;
        clearPayload();
        router.replace('/sign-in');
      } catch (error) {
        if (!isActive) {
          return;
        }
        isCompletingRef.current = false;
        setStatus('error');
        setMessage(
          getApiErrorMessage(
            error,
            '회원가입에 실패했습니다. 다시 시도해주세요.',
          ),
        );
      }
    };

    const pollVerification = async () => {
      try {
        const result = await confirmEmailVerification(payload.userId);

        if (!isActive || !result.verified) {
          return;
        }

        await completeSignUp();
      } catch (error) {
        if (!isActive) {
          return;
        }
        setStatus('error');
        setMessage(
          getApiErrorMessage(
            error,
            '이메일 인증 상태를 확인하지 못했습니다. 잠시 후 다시 시도합니다.',
          ),
        );
      }
    };

    void pollVerification();

    pollTimer = setInterval(() => {
      void pollVerification();
    }, EMAIL_VERIFICATION_POLL_INTERVAL_MS);

    expireTimer = setTimeout(() => {
      stopPolling();
      if (!isActive || isCompletingRef.current) {
        return;
      }
      setStatus('expired');
      setMessage('이메일 인증 시간이 만료되었습니다.');
    }, EMAIL_VERIFICATION_MAX_WAIT_MS);

    return () => {
      isActive = false;
      stopPolling();
    };
  }, [clearPayload, payload, router]);

  const handleSignInPress = () => {
    isLeavingRef.current = true;
    clearPayload();
    router.replace('/sign-in');
  };

  const isWaiting = status === 'waiting';

  return (
    <AuthPage>
      <AuthPage.Header title="이메일 인증" />

      <AuthPage.Body>
        <View style={styles.content}>
          {isWaiting ? (
            <ActivityIndicator color={palette.theme.blue[50]} size="small" />
          ) : null}

          <View style={styles.messageGroup}>
            <Typography
              variant="body1"
              weight="semibold"
              style={styles.message}
            >
              {message}
            </Typography>
            {payload ? (
              <Typography variant="body2" style={styles.email}>
                {payload.userId}
              </Typography>
            ) : null}
            {isWaiting ? (
              <Typography variant="body2" style={styles.subMessage}>
                이메일 인증을 확인하고 있어요
              </Typography>
            ) : null}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            variant="ghost"
            title="로그인하기"
            style={styles.link}
            textStyle={styles.loginButtonText}
            textColor={palette.theme.gray[90]}
            onPress={handleSignInPress}
          />
        </View>
      </AuthPage.Body>
    </AuthPage>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[5],
  },

  messageGroup: {
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },

  message: {
    color: palette.theme.gray[70],
    textAlign: 'center',
  },

  email: {
    color: palette.theme.gray[70],
    textAlign: 'center',
  },

  subMessage: {
    color: palette.theme.gray[50],
    textAlign: 'center',
  },

  actions: {
    width: '100%',
    marginTop: 'auto',
  },

  link: {
    width: '100%',
    height: baseFoundation.dimension.x44,
    shadowOpacity: 0,
    elevation: 0,
  },

  loginButtonText: {
    fontSize: theme.foundation.typography.size.body1,
  },
}));
