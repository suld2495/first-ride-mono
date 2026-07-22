import {
  confirmEmailVerification,
  join as signUpWithEmail,
} from '@repo/shared/api';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import AuthPage from '@/components/auth/auth-page';
import { Button } from '@/components/ui/button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import {
  useClearPendingSignUpPayload,
  usePendingSignUpPayload,
} from '@/hooks/usePendingSignUp';
import { baseFoundation, palette } from '@/theme/tokens';
import {
  getEmailVerificationBackoffDelay,
  getRetryAfterDelay,
} from '@/utils/email-verification-polling';
import { getApiErrorMessage } from '@/utils/error-utils';

const EMAIL_VERIFICATION_POLL_INTERVAL_MS = 2500;
const EMAIL_VERIFICATION_MAX_WAIT_MS = 30 * 60 * 1000;
const EMAIL_VERIFICATION_WAITING_MESSAGE =
  '이메일로 보낸 인증 링크를 클릭해주세요';
const EMAIL_VERIFICATION_ERROR_MESSAGE =
  '이메일 인증 상태를 확인하지 못했습니다. 잠시 후 다시 시도합니다.';

type VerificationStatus = 'waiting' | 'verified' | 'expired' | 'error';

export default function SignUpEmailVerification() {
  const { replace } = useRouter();
  const { theme } = useAppTheme();
  const payload = usePendingSignUpPayload();
  const clearPayload = useClearPendingSignUpPayload();
  const { showToast } = useToast();
  const [status, setStatus] = useState<VerificationStatus>('waiting');
  const [message, setMessage] = useState(EMAIL_VERIFICATION_WAITING_MESSAGE);
  const isCompletingRef = useRef(false);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!payload) {
      if (!isLeavingRef.current) {
        replace('/sign-up');
      }
      return undefined;
    }

    let isActive = true;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let expireTimer: ReturnType<typeof setTimeout> | null = null;
    let activeRequestController: AbortController | null = null;
    let hasExpired = false;
    let consecutiveFailures = 0;

    const clearPollTimer = () => {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    };

    const stopPolling = () => {
      clearPollTimer();
      if (expireTimer) {
        clearTimeout(expireTimer);
        expireTimer = null;
      }
      activeRequestController?.abort();
      activeRequestController = null;
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
        showToast('회원가입이 완료되었습니다.', 'success');
        replace('/sign-in');
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

    const scheduleNextPoll = (delay: number) => {
      if (!isActive || hasExpired || isCompletingRef.current) {
        return;
      }

      clearPollTimer();
      pollTimer = setTimeout(() => {
        pollTimer = null;
        void pollVerification();
      }, delay);
    };

    const pollVerification = async () => {
      const requestController = new AbortController();

      activeRequestController = requestController;

      try {
        const result = await confirmEmailVerification(
          payload.userId,
          requestController.signal,
        );

        if (activeRequestController === requestController) {
          activeRequestController = null;
        }

        if (!isActive || hasExpired || requestController.signal.aborted) {
          return;
        }

        if (result.verified) {
          await completeSignUp();
          return;
        }

        consecutiveFailures = 0;
        setStatus('waiting');
        setMessage(EMAIL_VERIFICATION_WAITING_MESSAGE);
        scheduleNextPoll(EMAIL_VERIFICATION_POLL_INTERVAL_MS);
      } catch (error) {
        if (activeRequestController === requestController) {
          activeRequestController = null;
        }

        if (!isActive || hasExpired || requestController.signal.aborted) {
          return;
        }

        consecutiveFailures += 1;
        setStatus('error');
        setMessage(getApiErrorMessage(error, EMAIL_VERIFICATION_ERROR_MESSAGE));

        const retryDelay =
          getRetryAfterDelay(error) ??
          getEmailVerificationBackoffDelay(consecutiveFailures);

        scheduleNextPoll(retryDelay);
      }
    };

    expireTimer = setTimeout(() => {
      hasExpired = true;
      stopPolling();
      if (!isActive || isCompletingRef.current) {
        return;
      }
      setStatus('expired');
      setMessage('이메일 인증 시간이 만료되었습니다.');
    }, EMAIL_VERIFICATION_MAX_WAIT_MS);

    void pollVerification();

    return () => {
      isActive = false;
      stopPolling();
    };
  }, [clearPayload, payload, replace, showToast]);

  const handleSignInPress = () => {
    isLeavingRef.current = true;
    clearPayload();
    replace('/sign-in');
  };

  const isWaiting = status === 'waiting';

  return (
    <AuthPage>
      <AuthPage.Header title="이메일 인증" />

      <AuthPage.Body>
        <View style={styles.content}>
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
            textColor={theme.colors.text.gray}
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
    color: theme.colors.text.label,
    textAlign: 'center',
  },

  email: {
    color: theme.colors.text.label,
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
