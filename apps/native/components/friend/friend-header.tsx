import NotificationBell from '@/components/notification/notification-bell';
import { Divider } from '@/components/ui/divider';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import Typography from '@/components/ui/typography';

interface FriendHeaderProps {
  requestCount: number;
}

const FriendHeader = ({ requestCount }: FriendHeaderProps) => {
  return (
    <>
      <ThemeView style={styles.header}>
        <Typography variant="title" weight="semibold">
          친구 리스트
        </Typography>
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
    paddingHorizontal: theme.foundation.spacing[4],
    paddingVertical: theme.foundation.spacing[4],
  },
  headerRight: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[2],
    alignItems: 'center',
  },
}));
