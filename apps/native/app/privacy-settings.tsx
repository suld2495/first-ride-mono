import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useToast } from '@/contexts/ToastContext';
import {
  getClarityAnalyticsEnabled,
  setClarityAnalyticsEnabled,
} from '@/utils/clarity';

export default function PrivacySettingsPage() {
  const { showToast } = useToast();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void getClarityAnalyticsEnabled().then((enabled) => {
      if (isMounted) {
        setAnalyticsEnabled(enabled);
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnalyticsChange = useCallback(
    async (enabled: boolean) => {
      const previousValue = analyticsEnabled;

      setIsSaving(true);

      try {
        await setClarityAnalyticsEnabled(enabled);
        setAnalyticsEnabled(enabled);
        showToast(
          enabled
            ? '사용 데이터 분석을 켰습니다.'
            : '사용 데이터 분석을 껐습니다.',
          'success',
        );
      } catch {
        setAnalyticsEnabled(previousValue);
        showToast('분석 수집 설정을 변경하지 못했습니다.', 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [analyticsEnabled, showToast],
  );

  return (
    <Container noPadding>
      <PageHeader title="개인정보 설정" showBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <View style={styles.intro}>
          <Typography variant="h3" weight="bold">
            분석 데이터는 직접 선택해 주세요
          </Typography>
          <Typography color="secondary" variant="body2">
            선택하지 않으면 Microsoft Clarity가 시작되지 않습니다. 언제든
            아래 설정을 끌 수 있습니다.
          </Typography>
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingText}>
            <Typography variant="body1" weight="semibold">
              사용 데이터 분석
            </Typography>
            <Typography color="secondary" variant="caption1">
              화면 이용 흐름과 오류·성능 정보를 수집해 서비스 개선에
              사용합니다. 입력한 비밀번호와 인증 토큰은 분석 목적으로
              전송하지 않습니다.
            </Typography>
          </View>
          <Switch
            accessibilityLabel="사용 데이터 분석"
            accessibilityState={{
              checked: analyticsEnabled,
              disabled: !isReady || isSaving,
            }}
            disabled={!isReady || isSaving}
            onValueChange={(enabled) => {
              void handleAnalyticsChange(enabled);
            }}
            testID="privacy-settings-analytics-switch"
            value={analyticsEnabled}
          />
        </View>

        <View style={styles.notice}>
          <Typography color="secondary" variant="caption1">
            이 설정을 끄면 현재 분석 세션을 중지하고, 다음 앱 실행에서도
            사용자가 다시 켤 때까지 Clarity를 초기화하지 않습니다.
          </Typography>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.foundation.spacing[5],
    paddingHorizontal: theme.foundation.spacing[4],
    paddingTop: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[8],
  },
  intro: {
    gap: theme.foundation.spacing[2],
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[4],
    padding: theme.foundation.spacing[4],
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
  },
  settingText: {
    flex: 1,
    gap: theme.foundation.spacing[1],
  },
  notice: {
    paddingHorizontal: theme.foundation.spacing[1],
  },
}));
