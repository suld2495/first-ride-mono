import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { StyleSheet } from 'react-native-unistyles';

import NotificationBell from '@/components/notification/notification-bell';
import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';
import { useAuthUser } from '@/hooks/useAuthSession';

const Header = () => {
  const user = useAuthUser();
  const { data: requests } = useFetchReceivedRequestsQuery(
    user?.nickname || '',
  );

  return (
    <ThemeView style={styles.container}>
      <ThemeView>
        <PixelText variant="title">{user?.nickname}</PixelText>
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
