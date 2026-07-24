import { useCreateBetaFeedbackMutation } from '@repo/shared/hooks/useBetaFeedback';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useToast } from '@/contexts/ToastContext';
import { baseFoundation } from '@/theme/tokens';

const MAX_FEEDBACK_LENGTH = 1000;
const FEEDBACK_GUIDES = [
  '어떤 화면에서',
  '무엇을 하던 중에',
  '어떤 일이 있었는지',
] as const;

export default function BetaFeedbackPage() {
  const { showToast } = useToast();
  const createFeedbackMutation = useCreateBetaFeedbackMutation();
  const [content, setContent] = useState('');

  const trimmedContent = useMemo(() => content.trim(), [content]);
  const isEmpty = trimmedContent.length === 0;
  const isTooLong = content.length > MAX_FEEDBACK_LENGTH;
  const validationMessage = isTooLong
    ? '피드백은 1000자 이하로 입력해주세요.'
    : isEmpty
      ? '피드백 내용을 입력해주세요.'
      : null;
  const canSubmit =
    !isEmpty && !isTooLong && !createFeedbackMutation.isPending;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    createFeedbackMutation.mutate(
      { content: trimmedContent },
      {
        onSuccess: () => {
          setContent('');
          showToast('피드백이 제출되었습니다.', 'success');
        },
        onError: () => {
          showToast(
            '피드백 제출에 실패했습니다. 잠시 후 다시 시도해주세요.',
            'error',
          );
        },
      },
    );
  }, [canSubmit, createFeedbackMutation, showToast, trimmedContent]);

  return (
    <Container noPadding>
      <PageHeader title="베타 피드백" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.formContent}>
            <View style={styles.intro}>
              <Typography
                color="$brandText"
                variant="h3"
                weight="bold"
              >
                작은 의견도 큰 도움이 돼요
              </Typography>
              <Typography color="secondary" variant="body2">
                불편했던 순간을 조금만 자세히 알려주세요.
              </Typography>
            </View>

            <View style={styles.guideSection}>
              <Typography variant="body1" weight="semibold">
                이렇게 적어주시면 좋아요
              </Typography>
              <View style={styles.guideList}>
                {FEEDBACK_GUIDES.map((guide, index) => (
                  <View key={guide} style={styles.guideRow}>
                    <Typography
                      color="$actionPrimary"
                      variant="body3"
                      weight="semibold"
                    >
                      {index + 1}.
                    </Typography>
                    <Typography variant="body2">{guide}</Typography>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.fieldSection}>
              <View style={styles.fieldLabelRow}>
                <Typography variant="body2" weight="semibold">
                  피드백 내용
                </Typography>
                <Typography color="link" variant="caption1" weight="semibold">
                  필수
                </Typography>
              </View>
              <Input
                accessibilityLabel="피드백 내용"
                containerTestID="beta-feedback-content-field"
                error={isTooLong}
                fullWidth
                inputStyle={styles.feedbackInput}
                multiline
                onChangeText={setContent}
                placeholder="사용하면서 불편했던 점이나 오류를 자유롭게 알려주세요."
                returnKeyType="default"
                style={styles.feedbackInputContainer}
                testID="beta-feedback-content-input"
                textAlignVertical="top"
                value={content}
              />
              <View style={styles.fieldMeta}>
                <Typography
                  color={isTooLong ? 'error' : 'secondary'}
                  variant="caption1"
                >
                  {content.length} / {MAX_FEEDBACK_LENGTH}
                </Typography>
              </View>
              {validationMessage ? (
                <Typography
                  color={isTooLong ? 'error' : 'secondary'}
                  variant="caption1"
                >
                  {validationMessage}
                </Typography>
              ) : null}
            </View>
          </View>

          <Button
            accessibilityLabel="피드백 보내기"
            disabled={!canSubmit}
            fullWidth
            loading={createFeedbackMutation.isPending}
            onPress={handleSubmit}
            size="lg"
            testID="beta-feedback-submit-button"
          >
            피드백 보내기
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
    paddingHorizontal: theme.foundation.spacing[5],
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[8],
  },
  formContent: {
    gap: theme.foundation.spacing[5],
  },
  intro: {
    gap: theme.foundation.spacing[2],
    paddingBottom: theme.foundation.spacing[1],
  },
  guideSection: {
    gap: theme.foundation.spacing[3],
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
    paddingTop: theme.foundation.spacing[4],
  },
  guideList: {
    gap: theme.foundation.spacing[3],
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  fieldSection: {
    gap: theme.foundation.spacing[2],
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
    paddingHorizontal: theme.foundation.spacing[1],
  },
  feedbackInputContainer: {
    height: 240,
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: theme.foundation.spacing[3],
  },
  feedbackInput: {
    minHeight: 214,
    fontSize: theme.foundation.typography.size.m,
    lineHeight: 21,
  },
  fieldMeta: {
    alignItems: 'flex-end',
    paddingHorizontal: theme.foundation.spacing[1],
  },
}));
