import { StyleSheet } from 'react-native';
import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useAuthStore } from '@repo/shared/store/auth.store';

import DarkMode from '../common/DarkMode';
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

      <ThemeView style={styles.icon_container}>
        <NotificationBell
          count={requests.length}
          url="/modal?type=request-list"
        />
        <DarkMode />
      </ThemeView>
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

  icon_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
