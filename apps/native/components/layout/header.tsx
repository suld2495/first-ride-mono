import PageHeader from '@/components/layout/page-header';
import NotificationBell from '@/components/notification/notification-bell';
import { StyleSheet } from '@/components/ui/tamagui';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { baseFoundation } from '@/theme/tokens';

const Header = () => {
  const user = useAuthUser();
  const { data: requests } = useReceivedRequests(user?.nickname || '');

  return (
    <PageHeader
      title={user?.nickname}
      right={
        <NotificationBell
          count={requests.length}
          size="sm"
          style={styles.actionButton}
          url="/modal?type=request-list"
        />
      }
    />
  );
};

export default Header;

const styles = StyleSheet.create({
  actionButton: {
    width: baseFoundation.dimension.x24,
    minWidth: baseFoundation.dimension.x24,
  },
});
