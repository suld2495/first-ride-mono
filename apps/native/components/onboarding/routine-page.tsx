import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { View } from 'react-native';

import Button from '@/components/ui/button';
import Checkbox from '@/components/ui/checkbox';
import Divider from '@/components/ui/divider';
import { Input } from '@/components/ui/input';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { commonStatusFilterColors } from '@/theme/themes/common';

type CertificationMode = 'self' | 'mate';

const MODES = [
  { id: 'self', label: '개인 루틴' },
  { id: 'mate', label: '메이트 루틴' },
] as const;

const ignorePreviewPress = () => undefined;

interface CertificationFlowProps {
  title: string;
  steps: string;
  icon: 'camera-outline' | 'chatbubble-ellipses-outline';
}

function CertificationFlow({ title, steps, icon }: CertificationFlowProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.flow}>
      <Ionicons
        name={icon}
        size={theme.foundation.iconSize.m}
        color={theme.colors.text.label}
      />
      <View style={styles.flowText}>
        <Typography
          variant="body3"
          weight="semibold"
          color={theme.colors.text.gray}
        >
          {title}
        </Typography>
        <Typography
          variant="caption1"
          color={theme.colors.text.label}
          style={styles.steps}
        >
          {steps}
        </Typography>
      </View>
    </View>
  );
}

export default function RoutinePage() {
  const { theme } = useAppTheme();
  const [mode, setMode] = useState<CertificationMode>('self');
  const isMate = mode === 'mate';
  const statusColors = theme.colors.filter?.status ?? commonStatusFilterColors;

  return (
    <View style={styles.body}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {MODES.map((item) => (
          <Button
            key={item.id}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: mode === item.id }}
            aria-selected={mode === item.id}
            onPress={() => setMode(item.id)}
            variant="ghost"
            style={[
              styles.tab,
              {
                borderColor:
                  mode === item.id
                    ? statusColors.activeBorder
                    : statusColors.inactiveBorder,
                backgroundColor:
                  mode === item.id
                    ? statusColors.activeBackground
                    : theme.colors.action.ghost.default,
              },
            ]}
          >
            <Typography
              variant="body3"
              weight="semibold"
              color={
                mode === item.id
                  ? statusColors.activeText
                  : statusColors.inactiveText
              }
            >
              {item.label}
            </Typography>
          </Button>
        ))}
      </View>

      <View style={styles.scene}>
        <View
          accessible
          accessibilityLabel="루틴 예시: 아침 물 한 잔 마시기, 체크된 상태"
          accessibilityRole="image"
        >
          <View
            style={styles.routinePreview}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            aria-hidden
          >
            <Checkbox
              size="lg"
              isChecked
              disabled
              disableText
              onPress={ignorePreviewPress}
            />
            <View style={styles.flowText}>
              <Input
                value="아침 물 한 잔 마시기"
                variant="filled"
                editable={false}
                caretHidden
                focusable={false}
                tabIndex={-1}
                accessible={false}
              />
            </View>
          </View>
          <Typography
            variant="caption2"
            color={theme.colors.text.label}
            textAlign="center"
            style={styles.previewLabel}
          >
            {isMate ? '메이트와 함께하는 루틴' : '나와 약속한 루틴'}
          </Typography>
        </View>
        <View style={styles.sceneCaption}>
          <Ionicons
            name={isMate ? 'people-outline' : 'checkmark-circle-outline'}
            size={theme.foundation.iconSize.s}
            color={theme.colors.brand.icon}
          />
          <Typography
            variant="caption1"
            weight="medium"
            color={theme.colors.text.label}
          >
            {isMate
              ? '메이트의 승인으로 인증 완료!'
              : '체크박스를 누르면 인증이 시작돼요'}
          </Typography>
        </View>
      </View>

      <View style={styles.flows} accessibilityLiveRegion="polite">
        {isMate ? (
          <>
            <CertificationFlow
              title="사진으로 인증을 요청해요"
              steps="체크박스 선택 → 사진 첨부 후 인증 요청"
              icon="camera-outline"
            />
            <CertificationFlow
              title="메이트가 확인하면 완료!"
              steps="메이트가 인증 승인 → 루틴 인증 완료"
              icon="chatbubble-ellipses-outline"
            />
          </>
        ) : (
          <>
            <CertificationFlow
              title="사진이 있는 개인 루틴"
              steps="체크박스 선택 → 사진 첨부 → 인증 완료"
              icon="camera-outline"
            />
            <CertificationFlow
              title="사진이 없는 개인 루틴"
              steps={
                '체크박스 선택 → 인증 모달에서 ‘예’ → 완료\n‘아니요’를 선택하면 인증을 취소해요.'
              }
              icon="chatbubble-ellipses-outline"
            />
          </>
        )}
      </View>
      <Divider />
      <View style={styles.notice}>
        <Ionicons
          name="information-circle-outline"
          size={theme.foundation.iconSize.s}
          color={theme.colors.text.label}
        />
        <Typography
          variant="caption2"
          color={theme.colors.text.label}
          style={styles.flowText}
        >
          인증 사진은 일주일 후 완전히 삭제되어 상세 페이지에서도 다시 확인할 수
          없어요.
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  body: { gap: theme.foundation.spacing[4] },
  tabs: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[2],
  },
  tab: {
    flex: 1,
    borderRadius: theme.foundation.radii.round,
    borderWidth: theme.foundation.dimension.x1,
  },
  scene: {
    paddingVertical: theme.foundation.spacing[3],
    gap: theme.foundation.spacing[4],
  },
  sceneCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[2],
  },
  routinePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
  },
  previewLabel: { marginTop: theme.foundation.spacing[2] },
  flows: { gap: theme.foundation.spacing[4] },
  flow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.foundation.spacing[3],
  },
  flowText: { flex: 1, gap: theme.foundation.spacing[1] },
  steps: { marginTop: theme.foundation.spacing[1] },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.foundation.spacing[2],
  },
}));
