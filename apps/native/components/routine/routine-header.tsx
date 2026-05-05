import Ionicons from '@expo/vector-icons/Ionicons';
import { afterWeek, beforeWeek } from '@repo/shared/utils';
import type { Href } from 'expo-router';
import { View } from 'react-native';

import NotificationBell from '@/components/notification/notification-bell';
import Link from '@/components/ui/link';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { baseFoundation } from '@/theme/tokens';

interface RoutineHeaderProps {
  date: string;
  getDateHref?: (date: string) => Href;
  showNotification?: boolean;
}

const RoutineHeader = ({
  date,
  getDateHref = (targetDate) =>
    `/(tabs)/(afterLogin)/(routine)?date=${targetDate}` as Href,
  showNotification = true,
}: RoutineHeaderProps) => {
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
    <ThemeView style={styles.container} transparent>
      <ThemeView style={styles.topBar} transparent>
        <View style={styles.dateNavigation}>
          <Link
            variant="ghost"
            href={getDateHref(beforeWeek(currentDate))}
            leftIcon={({ color }) => (
              <Ionicons
                name="chevron-back"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            accessibilityLabel="이전 주"
            accessibilityRole="button"
            style={styles.dateArrow}
          />
          <Typography variant="body1" style={styles.dateTitle}>
            {formattedDate}
          </Typography>
          <Link
            variant="ghost"
            href={getDateHref(afterWeek(currentDate))}
            leftIcon={({ color }) => (
              <Ionicons
                name="chevron-forward"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            accessibilityLabel="다음 주"
            accessibilityRole="button"
            style={styles.dateArrow}
          />
        </View>
        {showNotification ? (
          <View style={styles.notification}>
            <NotificationBell
              count={requests.length}
              url="/modal?type=request-list"
            />
          </View>
        ) : null}
      </ThemeView>
    </ThemeView>
  );
};

export default RoutineHeader;

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: baseFoundation.spacing.none,
    marginTop: theme.foundation.spacing.s,
  },

  topBar: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing.m,
    minHeight: baseFoundation.dimension.x44,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing.xs,
  },

  dateTitle: {
    color: theme.colors.text.title,
  },

  dateArrow: {
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    minHeight: baseFoundation.dimension.x28,
    minWidth: baseFoundation.dimension.x28,
    paddingHorizontal: baseFoundation.spacing.none,
    paddingVertical: baseFoundation.spacing.none,
  },
  notification: {
    position: 'absolute',
    right: theme.foundation.spacing.m,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
}));
