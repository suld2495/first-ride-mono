import Ionicons from '@expo/vector-icons/Ionicons';
import type { VerificationType } from '@repo/types';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';

interface QuestInfoProps {
  verificationType: VerificationType;
  currentVerificationCount: number;
  verificationTargetCount: number;
}

const VERIFICATION_CONTENT: Record<
  VerificationType,
  {
    title: string;
    currentLabel: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    colorKey: 'success' | 'warning' | 'info';
  }
> = {
  WEEKLY_APP_VISIT: {
    title: '앱 방문 진행률',
    currentLabel: '방문 횟수',
    description: '이번 주 앱 방문 횟수를 기준으로 달성 여부를 확인해요.',
    icon: 'phone-portrait-outline',
    colorKey: 'info',
  },
  WEEKLY_MATE_ROUTINE_REVIEW: {
    title: '메이트 리뷰 진행률',
    currentLabel: '리뷰 처리 횟수',
    description:
      '메이트 루틴 인증 요청을 처리한 횟수를 기준으로 달성 여부를 확인해요.',
    icon: 'people-outline',
    colorKey: 'warning',
  },
  WEEKLY_SELF_ROUTINE_PASS: {
    title: '내 루틴 인증 진행률',
    currentLabel: '인증 성공 횟수',
    description: '내 루틴 인증이 승인된 횟수를 기준으로 달성 여부를 확인해요.',
    icon: 'checkmark-done-outline',
    colorKey: 'success',
  },
};

const DEFAULT_VERIFICATION_CONTENT = {
  title: '퀘스트 진행률',
  currentLabel: '진행 횟수',
  description: '현재 누적된 진행 횟수를 기준으로 달성 여부를 확인해요.',
  icon: 'analytics-outline' as keyof typeof Ionicons.glyphMap,
  colorKey: 'info' as const,
};

const QuestInfo = ({
  verificationType,
  currentVerificationCount,
  verificationTargetCount,
}: QuestInfoProps) => {
  const { theme } = useUnistyles();
  const verificationInfo =
    VERIFICATION_CONTENT[verificationType] ?? DEFAULT_VERIFICATION_CONTENT;
  const verificationProgress =
    verificationTargetCount > 0
      ? Math.min(
          (currentVerificationCount / verificationTargetCount) * 100,
          100,
        )
      : 0;
  const verificationProgressLabel = `${Math.round(verificationProgress)}%`;
  const verificationCountLabel = `${currentVerificationCount}회 / ${verificationTargetCount}회`;
  const verificationColor =
    verificationInfo.colorKey === 'success'
      ? theme.colors.feedback.success.text
      : verificationInfo.colorKey === 'warning'
        ? theme.colors.feedback.warning.text
        : theme.colors.feedback.info.text;

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.verificationContainer} transparent>
        <ThemeView style={styles.verificationHeader} transparent>
          <ThemeView style={styles.verificationTitleRow} transparent>
            <Ionicons
              name={verificationInfo.icon}
              size={18}
              color={verificationColor}
            />
            <Typography variant="label" style={styles.verificationTitle}>
              {verificationInfo.title}
            </Typography>
          </ThemeView>
          <Typography variant="label" style={{ color: verificationColor }}>
            {verificationProgressLabel}
          </Typography>
        </ThemeView>

        <Typography variant="caption" color="secondary">
          {verificationInfo.description}
        </Typography>

        <ThemeView style={styles.progressSection} transparent>
          <ThemeView style={styles.partyHeader} transparent>
            <Typography variant="caption" color="secondary">
              현재 달성률
            </Typography>
            <Typography variant="caption" color="secondary">
              {verificationCountLabel}
            </Typography>
          </ThemeView>

          <ThemeView style={styles.progressBackground}>
            <ThemeView
              style={[
                styles.progressFill,
                {
                  width: `${verificationProgress}%`,
                  backgroundColor: verificationColor,
                },
              ]}
            />
          </ThemeView>
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default QuestInfo;

const styles = StyleSheet.create((theme) => ({
  container: {
    // Border removed
    backgroundColor: theme.colors.background.surface,
    padding: theme.foundation.spacing.m,
    borderRadius: theme.foundation.radii.m,
  },
  verificationContainer: {
    gap: 10,
    padding: 0,
  },

  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  verificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  verificationTitle: {
    fontWeight: '700',
  },

  progressSection: {
    marginTop: 4,
    paddingTop: theme.foundation.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background.sunken,
    gap: 8,
  },

  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.background.sunken,
    borderRadius: theme.foundation.radii.s,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.feedback.warning.text,
  },
}));
