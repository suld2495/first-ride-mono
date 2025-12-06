import { StyleSheet } from 'react-native-unistyles';
import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';

import { useAuthStore } from '@/store/auth.store';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';
import NotificationBell from '../notification/NotificationBell';

const Header = () => {
  const { user } = useAuthStore();
  const { data: requests } = useFetchReceivedRequestsQuery(
    user?.nickname || '',
  );

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
