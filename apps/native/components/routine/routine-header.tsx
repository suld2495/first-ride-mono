import Ionicons from '@expo/vector-icons/Ionicons';
import { afterWeek, beforeWeek } from '@repo/shared/utils';
import type { Href } from 'expo-router';
import { View } from 'react-native';

import PageHeader from '@/components/layout/page-header';
import NotificationBell from '@/components/notification/notification-bell';
import { Button } from '@/components/ui/button';
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
  onDateChange?: (date: string) => void;
  onPressReorder?: () => void;
  showNotification?: boolean;
}

const RoutineHeader = ({
  date,
  getDateHref = (targetDate) =>
    `/(tabs)/(afterLogin)/(routine)?date=${targetDate}` as Href,
  onDateChange,
  onPressReorder,
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
  const previousDate = beforeWeek(currentDate);
  const nextDate = afterWeek(currentDate);

  const renderDateArrow = (
    targetDate: string,
    iconName: 'chevron-back' | 'chevron-forward',
    accessibilityLabel: string,
  ) => {
    const leftIcon = () => (
      <Ionicons
        name={iconName}
        size={baseFoundation.iconSize.m}
        color={theme.colors.text.title}
      />
    );
    const sharedProps = {
      leftIcon,
      variant: 'ghost' as const,
      accessibilityLabel,
      accessibilityRole: 'button' as const,
      style: styles.dateArrow,
    };

    if (onDateChange) {
      return (
        <Button {...sharedProps} onPress={() => onDateChange(targetDate)} />
      );
    }

    return <Link {...sharedProps} href={getDateHref(targetDate)} />;
  };

  return (
    <PageHeader
      center={
        <View style={styles.dateNavigation}>
          {renderDateArrow(previousDate, 'chevron-back', '이전 주')}
          <Typography
            variant="body1"
            weight="semibold"
            style={styles.dateTitle}
          >
            {formattedDate}
          </Typography>
          {renderDateArrow(nextDate, 'chevron-forward', '다음 주')}
        </View>
      }
      right={
        showNotification || onPressReorder ? (
          <View style={styles.actions} testID="routine-header-actions">
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
                style={styles.actionButton}
                testID="routine-reorder-button"
              />
            ) : null}
            {showNotification ? (
              <NotificationBell
                count={requests.length}
                size="sm"
                style={styles.actionButton}
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
    gap: theme.foundation.spacing[1],
  },

  actionButton: {
    width: baseFoundation.dimension.x24,
    minWidth: baseFoundation.dimension.x24,
  },
}));
