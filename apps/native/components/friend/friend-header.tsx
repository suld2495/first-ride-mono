import PageHeader from '@/components/layout/page-header';
import NotificationBell from '@/components/notification/notification-bell';

interface FriendHeaderProps {
  requestCount: number;
}

const FriendHeader = ({ requestCount }: FriendHeaderProps) => {
  return (
    <PageHeader
      title="친구 목록"
      right={
        <NotificationBell
          count={requestCount}
          url="/modal?type=friend-request-list"
          accessibilityLabel={`친구 요청 알림${
            requestCount > 0 ? ` ${requestCount}건` : ''
          }`}
        />
      }
    />
  );
};

export default FriendHeader;
