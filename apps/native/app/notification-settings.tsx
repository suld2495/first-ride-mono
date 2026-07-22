import {
  type NotificationSettings,
  type NotificationSubtype,
} from '@repo/shared/api/notification-settings.api';
import {
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from '@repo/shared/hooks/useNotificationSettings';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, View } from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import Loading from '@/components/ui/loading';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const NOTIFICATION_SUBTYPE_LABELS: Record<NotificationSubtype, string> = {
  ROUTINE_CONFIRM_REQUEST: '인증 요청',
  ROUTINE_CONFIRM_APPROVED: '인증 승인',
  ROUTINE_CONFIRM_REJECTED: '인증 반려',
  ROUTINE_CHANGE_REQUEST: '루틴 변경 요청',
  ROUTINE_CHANGE_APPROVED: '루틴 변경 승인',
  ROUTINE_CHANGE_REJECTED: '루틴 변경 반려',
  DAILY_ROUTINE_REMINDER: '루틴 리마인더',
  LEVEL_UP: '레벨 업',
  FRIEND_REQUEST: '친구 요청',
  FRIEND_ACCEPTED: '친구 수락',
  QUEST_COMPLETE: '퀘스트 완료',
  QUEST_REWARD: '퀘스트 보상',
  SYSTEM: '시스템',
  RANKING: '랭킹',
};

type NotificationGroupId = 'routine' | 'friend' | 'quest' | 'growth' | 'system';

type NotificationGroup = {
  id: NotificationGroupId;
  title: string;
  description: string;
  subtypes: NotificationSubtype[];
};

const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    id: 'routine',
    title: '루틴 알림',
    description: '인증, 변경 요청, 리마인더 알림',
    subtypes: [
      'ROUTINE_CONFIRM_REQUEST',
      'ROUTINE_CONFIRM_APPROVED',
      'ROUTINE_CONFIRM_REJECTED',
      'ROUTINE_CHANGE_REQUEST',
      'ROUTINE_CHANGE_APPROVED',
      'ROUTINE_CHANGE_REJECTED',
      'DAILY_ROUTINE_REMINDER',
    ],
  },
  {
    id: 'friend',
    title: '친구 알림',
    description: '친구 요청과 수락 알림',
    subtypes: ['FRIEND_REQUEST', 'FRIEND_ACCEPTED'],
  },
  {
    id: 'quest',
    title: '퀘스트 알림',
    description: '퀘스트 완료와 보상 알림',
    subtypes: ['QUEST_COMPLETE', 'QUEST_REWARD'],
  },
  {
    id: 'growth',
    title: '성장/랭킹 알림',
    description: '레벨 업과 랭킹 알림',
    subtypes: ['LEVEL_UP', 'RANKING'],
  },
  {
    id: 'system',
    title: '시스템 알림',
    description: '운영 안내와 시스템 알림',
    subtypes: ['SYSTEM'],
  },
];

const createSubtypeUpdate = (
  subtypes: NotificationSubtype[],
  enabled: boolean,
): Partial<Record<NotificationSubtype, boolean>> =>
  Object.fromEntries(subtypes.map((subtype) => [subtype, enabled])) as Partial<
    Record<NotificationSubtype, boolean>
  >;

const getEnabledSubtypeCount = (
  subtypes: NotificationSubtype[],
  settings: Record<NotificationSubtype, boolean>,
): number => subtypes.filter((subtype) => settings[subtype]).length;

const SWITCH_THUMB_TRAVEL = baseFoundation.dimension.x20;
const SWITCH_ANIMATION_DURATION_MS = 160;

type SettingsErrorStateProps = {
  onRetry: () => void;
};

type NotificationSwitchProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  onValueChange: (enabled: boolean) => void;
  testID: string;
  value: boolean;
};

function NotificationSwitch({
  accessibilityLabel,
  disabled = false,
  onValueChange,
  testID,
  value,
}: NotificationSwitchProps) {
  const thumbTranslateX = useRef(
    new Animated.Value(value ? SWITCH_THUMB_TRAVEL : 0),
  ).current;

  useEffect(() => {
    const animation = Animated.timing(thumbTranslateX, {
      toValue: value ? SWITCH_THUMB_TRAVEL : 0,
      duration: SWITCH_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [thumbTranslateX, value]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      hitSlop={baseFoundation.dimension.x8}
      onPress={() => {
        onValueChange(!value);
      }}
      style={[
        styles.switchTrack,
        value ? styles.switchTrackOn : styles.switchTrackOff,
        disabled ? styles.switchTrackDisabled : null,
      ]}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.switchThumb,
          {
            transform: [{ translateX: thumbTranslateX }],
          },
        ]}
      />
    </Pressable>
  );
}

function SettingsErrorState({ onRetry }: SettingsErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Typography color="secondary" textAlign="center" variant="body2">
        알림 설정을 불러오지 못했습니다.
      </Typography>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={styles.retryButton}
      >
        <Typography color="inverse" variant="body3" weight="semibold">
          다시 시도
        </Typography>
      </Pressable>
    </View>
  );
}

type AllNotificationSectionProps = {
  allEnabled: boolean;
  onToggle: (allEnabled: boolean) => void;
};

function AllNotificationSection({
  allEnabled,
  onToggle,
}: AllNotificationSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.primaryRow}>
        <View style={styles.rowText}>
          <Typography variant="body1" weight="semibold">
            전체 알림
          </Typography>
          <Typography
            color="secondary"
            style={styles.description}
            variant="caption1"
          >
            모든 푸시 알림 수신 여부를 설정합니다.
          </Typography>
        </View>
        <NotificationSwitch
          accessibilityLabel="전체 알림"
          onValueChange={onToggle}
          testID="notification-settings-toggle-all"
          value={allEnabled}
        />
      </View>
      {!allEnabled ? (
        <View style={styles.notice}>
          <Typography color="warning" variant="caption1">
            모든 알림이 차단됩니다.
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

type NotificationSubtypeRowProps = {
  isEnabled: boolean;
  onToggle: (subtype: NotificationSubtype, enabled: boolean) => void;
  subtype: NotificationSubtype;
};

function NotificationSubtypeRow({
  isEnabled,
  onToggle,
  subtype,
}: NotificationSubtypeRowProps) {
  return (
    <View style={styles.subtypeRow}>
      <Typography color="primary" variant="body2">
        {NOTIFICATION_SUBTYPE_LABELS[subtype]}
      </Typography>
      <NotificationSwitch
        accessibilityLabel={NOTIFICATION_SUBTYPE_LABELS[subtype]}
        onValueChange={(enabled) => {
          onToggle(subtype, enabled);
        }}
        testID={`notification-settings-toggle-${subtype}`}
        value={isEnabled}
      />
    </View>
  );
}

type NotificationGroupItemProps = {
  allEnabled: boolean;
  group: NotificationGroup;
  onToggleGroup: (group: NotificationGroup, enabled: boolean) => void;
  onToggleSubtype: (subtype: NotificationSubtype, enabled: boolean) => void;
  settings: Record<NotificationSubtype, boolean>;
};

function NotificationGroupItem({
  allEnabled,
  group,
  onToggleGroup,
  onToggleSubtype,
  settings,
}: NotificationGroupItemProps) {
  const enabledSubtypeCount = getEnabledSubtypeCount(group.subtypes, settings);
  const isGroupEnabled = enabledSubtypeCount > 0;
  const isPartiallyEnabled =
    enabledSubtypeCount > 0 && enabledSubtypeCount < group.subtypes.length;
  const shouldShowSubtypes =
    allEnabled && isGroupEnabled && group.subtypes.length > 1;
  const groupDescription = isPartiallyEnabled
    ? `일부 알림만 켜짐 (${enabledSubtypeCount}/${group.subtypes.length})`
    : group.description;

  return (
    <View style={styles.groupBlock}>
      <View style={styles.groupHeader}>
        <View style={styles.rowText}>
          <Typography
            color={allEnabled ? 'primary' : 'secondary'}
            variant="body2"
            weight="semibold"
          >
            {group.title}
          </Typography>
          <Typography
            color="secondary"
            style={styles.description}
            variant="caption1"
          >
            {groupDescription}
          </Typography>
        </View>
        <NotificationSwitch
          accessibilityLabel={group.title}
          disabled={!allEnabled}
          onValueChange={(enabled) => {
            onToggleGroup(group, enabled);
          }}
          testID={`notification-settings-toggle-group-${group.id}`}
          value={allEnabled && isGroupEnabled}
        />
      </View>
      {shouldShowSubtypes ? (
        <View style={styles.subtypeList}>
          {group.subtypes.map((subtype) => (
            <NotificationSubtypeRow
              key={subtype}
              isEnabled={settings[subtype]}
              onToggle={onToggleSubtype}
              subtype={subtype}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

type NotificationGroupsSectionProps = {
  onToggleGroup: (group: NotificationGroup, enabled: boolean) => void;
  onToggleSubtype: (subtype: NotificationSubtype, enabled: boolean) => void;
  settings: NotificationSettings;
};

function NotificationGroupsSection({
  onToggleGroup,
  onToggleSubtype,
  settings,
}: NotificationGroupsSectionProps) {
  return (
    <View style={styles.section}>
      <Typography style={styles.sectionTitle} variant="body2" weight="semibold">
        알림 유형
      </Typography>
      <View style={styles.groupList}>
        {NOTIFICATION_GROUPS.map((group) => (
          <NotificationGroupItem
            key={group.id}
            allEnabled={settings.allEnabled}
            group={group}
            onToggleGroup={onToggleGroup}
            onToggleSubtype={onToggleSubtype}
            settings={settings.subtypes}
          />
        ))}
      </View>
    </View>
  );
}

type NotificationSettingsContentProps = {
  onToggleAll: (allEnabled: boolean) => void;
  onToggleGroup: (group: NotificationGroup, enabled: boolean) => void;
  onToggleSubtype: (subtype: NotificationSubtype, enabled: boolean) => void;
  settings: NotificationSettings;
};

function NotificationSettingsContent({
  onToggleAll,
  onToggleGroup,
  onToggleSubtype,
  settings,
}: NotificationSettingsContentProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <Typography variant="h3" weight="bold" style={styles.introTitle}>
          받고 싶은 알림만 선택해 주세요
        </Typography>
        <Typography variant="body2" style={styles.introDescription}>
          필요한 소식은 놓치지 않고, 나머지는 조용히 관리할 수 있어요.
        </Typography>
      </View>
      <AllNotificationSection
        allEnabled={settings.allEnabled}
        onToggle={onToggleAll}
      />
      <NotificationGroupsSection
        onToggleGroup={onToggleGroup}
        onToggleSubtype={onToggleSubtype}
        settings={settings}
      />
    </ScrollView>
  );
}

export default function NotificationSettingsPage() {
  const { showToast } = useToast();
  const user = useAuthUser();
  const {
    data: settings,
    isError,
    isLoading,
    refetch,
  } = useNotificationSettingsQuery(user?.userId ?? '');
  const updateSettings = useUpdateNotificationSettingsMutation(
    user?.userId ?? '',
  );
  const handleMutationError = (error: unknown) => {
    showToast(
      getApiErrorMessage(error, '알림 설정을 변경하지 못했습니다.'),
      'error',
    );
  };

  const handleToggleAll = (allEnabled: boolean) => {
    updateSettings.mutate(
      { allEnabled },
      {
        onError: handleMutationError,
      },
    );
  };
  const handleToggleSubtype = (
    subtype: NotificationSubtype,
    enabled: boolean,
  ) => {
    updateSettings.mutate(
      {
        subtypes: {
          [subtype]: enabled,
        },
      },
      {
        onError: handleMutationError,
      },
    );
  };
  const handleToggleGroup = (group: NotificationGroup, enabled: boolean) => {
    updateSettings.mutate(
      {
        subtypes: createSubtypeUpdate(group.subtypes, enabled),
      },
      {
        onError: handleMutationError,
      },
    );
  };

  return (
    <Container noPadding style={styles.container}>
      <PageHeader title="알림 설정" showBackButton />
      {isLoading ? <Loading /> : null}
      {isError ? (
        <SettingsErrorState
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}
      {settings ? (
        <NotificationSettingsContent
          onToggleAll={handleToggleAll}
          onToggleGroup={handleToggleGroup}
          onToggleSubtype={handleToggleSubtype}
          settings={settings}
        />
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.base,
  },
  switchTrack: {
    width: baseFoundation.dimension.x52,
    height: baseFoundation.dimension.x32,
    justifyContent: 'center',
    borderRadius: baseFoundation.radii.round,
    padding: baseFoundation.dimension.x2,
  },
  switchTrackOn: {
    backgroundColor: theme.colors.action.primary.default,
  },
  switchTrackOff: {
    backgroundColor: theme.colors.border.default,
  },
  switchTrackDisabled: {
    opacity: 0.5,
  },
  switchThumb: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.radii.round,
    backgroundColor: theme.colors.background.elevated,
  },
  content: {
    paddingHorizontal: theme.foundation.spacing[5],
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: baseFoundation.dimension.x96,
    gap: theme.foundation.spacing[4],
  },
  intro: {
    gap: theme.foundation.spacing[2],
    paddingBottom: theme.foundation.spacing[2],
  },
  introTitle: {
    color: theme.colors.brand.text,
  },
  introDescription: {
    color: theme.colors.text.muted,
  },
  section: {
    borderRadius: theme.foundation.radii.m,
    backgroundColor: theme.colors.background.surface,
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[2],
  },
  primaryRow: {
    minHeight: baseFoundation.dimension.x72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[4],
  },
  rowText: {
    flex: 1,
  },
  description: {
    marginTop: theme.foundation.spacing[1],
  },
  notice: {
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
    paddingVertical: theme.foundation.spacing[3],
  },
  sectionTitle: {
    paddingVertical: theme.foundation.spacing[3],
  },
  groupList: {
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
  },
  groupBlock: {
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: theme.colors.border.divider,
  },
  groupHeader: {
    minHeight: baseFoundation.dimension.x72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[2],
  },
  subtypeList: {
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: theme.colors.border.divider,
    paddingVertical: theme.foundation.spacing[1],
  },
  subtypeRow: {
    minHeight: baseFoundation.dimension.x48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[4],
    paddingLeft: theme.foundation.spacing[3],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[6],
    gap: theme.foundation.spacing[4],
  },
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: baseFoundation.dimension.x40,
    paddingHorizontal: theme.foundation.spacing[4],
    borderRadius: theme.foundation.radii.s,
    backgroundColor: theme.colors.action.primary.default,
  },
}));
