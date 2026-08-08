import PageHeader from '@/components/layout/page-header';
import NotificationBell from '@/components/notification/notification-bell';
import { StyleSheet } from '@/components/ui/tamagui';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { baseFoundation } from '@/theme/tokens';

const QuestHeader = () => {
  const user = useAuthUser();
  const { notificationCount } = useReceivedRequests(user?.nickname || '');

  return (
    <PageHeader
      title="퀘스트 목록"
      right={
        <NotificationBell
          count={notificationCount}
          size="md"
          style={styles.actionButton}
          url="/modal?type=request-list"
        />
      }
    />
  );
};

export default QuestHeader;

const styles = StyleSheet.create({
  actionButton: {
    width: baseFoundation.dimension.x40,
    minWidth: baseFoundation.dimension.x40,
  },
});
