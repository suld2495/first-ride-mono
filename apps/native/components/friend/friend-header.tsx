import { useFetchFriendRequestsQuery } from '@repo/shared/hooks/useFriend';
import { useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import NotificationBell from '@/components/notification/notification-bell';
import { Divider } from '@/components/ui/divider';
import PixelText from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';

const FriendHeader = () => {
  const [page] = useState(1);
  const { data: list } = useFetchFriendRequestsQuery(page);

  if (!list) {
    return null;
  }

  return (
    <>
      <ThemeView style={styles.header}>
        <PixelText variant="title">친구 리스트</PixelText>
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
