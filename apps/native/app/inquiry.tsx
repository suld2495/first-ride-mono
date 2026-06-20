import { useCreateInquiryMutation } from '@repo/shared/hooks/useInquiry';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

const INITIAL_FORM = {
  replyEmail: '',
  title: '',
  content: '',
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INQUIRY_RECIPIENT_EMAIL = 'irura@gmail.com';
const INQUIRY_EMAIL_SUBJECT = '이루라 건의사항';

export default function InquiryPage() {
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const createInquiryMutation = useCreateInquiryMutation();
  const [form, setForm] = useState(INITIAL_FORM);

  const trimmedForm = useMemo(
    () => ({
      recipientEmail: INQUIRY_RECIPIENT_EMAIL,
      subject: INQUIRY_EMAIL_SUBJECT,
      replyEmail: form.replyEmail.trim(),
      title: form.title.trim(),
      content: form.content.trim(),
    }),
    [form.content, form.replyEmail, form.title],
  );
  const canSubmit =
    trimmedForm.replyEmail.length > 0 &&
    EMAIL_PATTERN.test(trimmedForm.replyEmail) &&
    trimmedForm.title.length > 0 &&
    trimmedForm.content.length > 0 &&
    !createInquiryMutation.isPending;
  const shouldShowReplyEmailError =
    trimmedForm.replyEmail.length > 0 &&
    !EMAIL_PATTERN.test(trimmedForm.replyEmail);

  const handleReplyEmailChange = useCallback((replyEmail: string) => {
    setForm((prev) => ({ ...prev, replyEmail }));
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setForm((prev) => ({ ...prev, title }));
  }, []);

  const handleContentChange = useCallback((content: string) => {
    setForm((prev) => ({ ...prev, content }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    createInquiryMutation.mutate(trimmedForm, {
      onSuccess: () => {
        setForm(INITIAL_FORM);
        showToast('문의가 접수되었습니다.', 'success');
      },
      onError: (error) => {
        showToast(
          getApiErrorMessage(error, '문의 접수에 실패했습니다.'),
          'error',
        );
      },
    });
  }, [canSubmit, createInquiryMutation, showToast, trimmedForm]);

  return (
    <Container noPadding>
      <PageHeader title="문의" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.formSection}>
            <Typography variant="body2" weight="semibold">
              이메일 문의
            </Typography>
            <Typography color="secondary" style={styles.description}>
              앱에서 바로 문의 내용을 작성해 보내주세요.
            </Typography>
            <Input
              accessibilityLabel="답변 받을 이메일"
              autoCapitalize="none"
              autoCorrect={false}
              error={shouldShowReplyEmailError}
              fullWidth
              helperText={
                shouldShowReplyEmailError
                  ? '올바른 이메일 주소를 입력해주세요.'
                  : undefined
              }
              keyboardType="email-address"
              label="답변 받을 이메일"
              onChangeText={handleReplyEmailChange}
              placeholder="example@email.com"
              returnKeyType="next"
              value={form.replyEmail}
            />
            <Input
              accessibilityLabel="문의 제목"
              fullWidth
              label="제목"
              onChangeText={handleTitleChange}
              placeholder="문의 제목을 입력하세요"
              returnKeyType="next"
              value={form.title}
            />
            <View style={styles.messageField}>
              <Typography style={styles.messageLabel} weight="semibold">
                내용
              </Typography>
              <View style={styles.messageInputContainer}>
                <TextInput
                  accessibilityLabel="문의 내용"
                  multiline
                  onChangeText={handleContentChange}
                  placeholder="문의 내용을 자세히 적어주세요"
                  placeholderTextColor={theme.colors.text.tertiary}
                  style={[
                    styles.messageInput,
                    { color: theme.colors.text.input },
                  ]}
                  textAlignVertical="top"
                  value={form.content}
                />
              </View>
            </View>
          </View>
          <Button
            accessibilityLabel="문의 보내기"
            disabled={!canSubmit}
            fullWidth
            loading={createInquiryMutation.isPending}
            onPress={handleSubmit}
            size="lg"
          >
            문의 보내기
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[6],
    paddingHorizontal: theme.foundation.spacing[4],
    paddingTop: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[8],
  },
  formSection: {
    gap: theme.foundation.spacing[4],
  },
  description: {
    marginTop: -theme.foundation.spacing[3],
  },
  messageField: {
    gap: theme.foundation.spacing[1.5],
  },
  messageLabel: {
    marginLeft: theme.foundation.spacing[1],
  },
  messageInputContainer: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
    borderRadius: theme.foundation.radii.xs,
    backgroundColor: theme.colors.background.input,
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: theme.foundation.spacing[3],
  },
  messageInput: {
    minHeight: 156,
    fontSize: theme.foundation.typography.size.m,
  },
}));
