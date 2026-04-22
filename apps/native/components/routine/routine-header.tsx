import Ionicons from '@expo/vector-icons/Ionicons';
import { afterWeek, beforeWeek } from '@repo/shared/utils';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

import NotificationBell from '@/components/notification/notification-bell';
import Link from '@/components/ui/link';
import { Typography } from '@/components/ui/typography';
import ThemeView from '@/components/ui/theme-view';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';

interface RoutineHeaderProps {
  date: string;
}

const RoutineHeader = ({ date }: RoutineHeaderProps) => {
  const user = useAuthUser();
  const { data: requests } = useReceivedRequests(user?.nickname || '');
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
            href={`/(tabs)/(afterLogin)/(routine)?date=${beforeWeek(currentDate)}`}
            leftIcon={({ color }) => (
              <Ionicons name="chevron-back" size={baseFoundation.iconSize.m} color={color} />
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
            href={`/(tabs)/(afterLogin)/(routine)?date=${afterWeek(currentDate)}`}
            leftIcon={({ color }) => (
              <Ionicons name="chevron-forward" size={baseFoundation.iconSize.m} color={color} />
            )}
            accessibilityLabel="다음 주"
            accessibilityRole="button"
            style={styles.dateArrow}
          />
        </View>
        <View style={styles.notification}>
          <NotificationBell count={requests.length} url="/modal?type=request-list" />
        </View>
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
    color: '#0B2038',
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
