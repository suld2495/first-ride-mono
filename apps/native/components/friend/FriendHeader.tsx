import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import { useFetchFriendRequestsQuery } from '@repo/shared/hooks/useFriend';

import { Divider } from '../common/Divider';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';
import NotificationBell from '../notification/NotificationBell';

const FriendHeader = () => {
  const [page] = useState(1);
  const { data: list } = useFetchFriendRequestsQuery(page);

  if (!list) {
    return null;
  }

  return (
    <>
      <ThemeView style={styles.header}>
        <Typography variant="title">친구 리스트</Typography>
        <ThemeView style={styles.headerRight} transparent>
          <NotificationBell
            count={list.length}
            url="/modal?type=friend-request-list"
          />
        </ThemeView>
      </ThemeView>
      <Divider />
    </>
  );
};

export default FriendHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
