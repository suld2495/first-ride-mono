import Ionicons from '@expo/vector-icons/Ionicons';
import { afterWeek, beforeWeek } from '@repo/shared/utils';
import type { Href } from 'expo-router';
import { View } from 'react-native';

import PageHeader from '@/components/layout/page-header';
import NotificationBell from '@/components/notification/notification-bell';
import IconButton from '@/components/ui/icon-button';
import Link from '@/components/ui/link';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { baseFoundation } from '@/theme/tokens';

const NOTIFICATION_ICON_COLOR = '#0E0E0E';

interface RoutineHeaderProps {
  date: string;
  getDateHref?: (date: string) => Href;
  onPressReorder?: () => void;
  onPressPausedRoutines?: () => void;
  showingPausedRoutines?: boolean;
  showNotification?: boolean;
}

const RoutineHeader = ({
  date,
  getDateHref = (targetDate) =>
    `/(tabs)/(afterLogin)/(routine)?date=${targetDate}` as Href,
  onPressReorder,
  onPressPausedRoutines,
  showingPausedRoutines = false,
  showNotification = true,
}: RoutineHeaderProps) => {
  const { theme } = useAppTheme();
  const user = useAuthUser();
  const { data: requests } = useReceivedRequests(
    showNotification ? user?.nickname || '' : '',
  );
  const currentDate = new Date(date);
  const formattedDate = `${currentDate.getFullYear()}. ${
    currentDate.getMonth() + 1
  }. ${currentDate.getDate()} ${
    ['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]
  }`;

  return (
    <PageHeader
      center={
        <View style={styles.dateNavigation}>
          <Link
            variant="ghost"
            href={getDateHref(beforeWeek(currentDate))}
            leftIcon={() => (
              <Ionicons
                name="chevron-back"
                size={baseFoundation.iconSize.m}
                color={theme.colors.text.title}
              />
            )}
            accessibilityLabel="이전 주"
            accessibilityRole="button"
            style={styles.dateArrow}
          />
          <Typography
            variant="body1"
            weight="semibold"
            style={styles.dateTitle}
          >
            {formattedDate}
          </Typography>
          <Link
            variant="ghost"
            href={getDateHref(afterWeek(currentDate))}
            leftIcon={() => (
              <Ionicons
                name="chevron-forward"
                size={baseFoundation.iconSize.m}
                color={theme.colors.text.title}
              />
            )}
            accessibilityLabel="다음 주"
            accessibilityRole="button"
            style={styles.dateArrow}
          />
        </View>
      }
      right={
        showNotification || onPressReorder || onPressPausedRoutines ? (
          <View style={styles.actions} testID="routine-header-actions">
            {onPressPausedRoutines ? (
              <IconButton
                size="sm"
                variant="ghost"
                icon={({ size }) => (
                  <Ionicons
                    name={showingPausedRoutines ? 'eye' : 'eye-off'}
                    size={size}
                    color={NOTIFICATION_ICON_COLOR}
                  />
                )}
                onPress={onPressPausedRoutines}
                accessibilityLabel={
                  showingPausedRoutines ? '전체 루틴 보기' : '숨김 루틴 보기'
                }
                accessibilityRole="button"
                testID="routine-paused-list-button"
              />
            ) : null}
            {onPressReorder ? (
              <IconButton
                size="sm"
                variant="ghost"
                icon={({ size }) => (
                  <Ionicons
                    name="swap-vertical"
                    size={size}
                    color={NOTIFICATION_ICON_COLOR}
                  />
                )}
                onPress={onPressReorder}
                accessibilityLabel="루틴 순서 변경"
                accessibilityRole="button"
                testID="routine-reorder-button"
              />
            ) : null}
            {showNotification ? (
              <NotificationBell
                count={requests.length}
                url="/modal?type=request-list"
              />
            ) : null}
          </View>
        ) : null
      }
    />
  );
};

export default RoutineHeader;

const styles = StyleSheet.create((theme) => ({
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[1],
  },

  dateTitle: {
    color: theme.colors.text.title,
  },

  dateArrow: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    minHeight: baseFoundation.dimension.x28,
    minWidth: baseFoundation.dimension.x28,
    paddingHorizontal: baseFoundation.spacing[0],
    paddingVertical: baseFoundation.spacing[0],
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[0.5],
  },
}));
