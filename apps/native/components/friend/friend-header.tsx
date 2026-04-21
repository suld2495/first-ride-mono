import { StyleSheet } from '@/lib/unistyles';

import NotificationBell from '@/components/notification/notification-bell';
import { Divider } from '@/components/ui/divider';
import Typography from '@/components/ui/typography';
import ThemeView from '@/components/ui/theme-view';

interface FriendHeaderProps {
  requestCount: number;
}

const FriendHeader = ({ requestCount }: FriendHeaderProps) => {
  return (
    <>
      <ThemeView style={styles.header}>
        <Typography variant="title">친구 리스트</Typography>
        <ThemeView style={styles.headerRight} transparent>
          <NotificationBell
            count={requestCount}
            url="/modal?type=friend-request-list"
          />
        </ThemeView>
      </ThemeView>
      <Divider />
    </>
  );
};

export default FriendHeader;

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.foundation.spacing.m,
    paddingVertical: theme.foundation.spacing.m,
  },
  headerRight: {
    flexDirection: 'row',
    gap: theme.foundation.spacing.s,
    alignItems: 'center',
  },
}));
