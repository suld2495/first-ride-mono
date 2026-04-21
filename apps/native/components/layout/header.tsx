import NotificationBell from '@/components/notification/notification-bell';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { StyleSheet } from '@/lib/unistyles';

const Header = () => {
  const user = useAuthUser();
  const { data: requests } = useReceivedRequests(user?.nickname || '');

  return (
    <ThemeView style={styles.container}>
      <ThemeView>
        <Typography variant="title">{user?.nickname}</Typography>
      </ThemeView>

      <NotificationBell
        count={requests.length}
        url="/modal?type=request-list"
      />
    </ThemeView>
  );
};

export default Header;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.foundation.spacing.s,
    paddingHorizontal: theme.foundation.spacing.m,
  },
}));
