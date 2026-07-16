import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useFetchFriendRequestsQuery,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { getWeekMonday } from '@repo/shared/utils';
import type { Friend } from '@repo/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import FriendAddModal from '@/components/friend/friend-add-modal';
import FriendHeader from '@/components/friend/friend-header';
import FriendList from '@/components/friend/friend-list';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useClearAppColorSchemeOverride } from '@/hooks/useThemePreference';
import { baseFoundation } from '@/theme/tokens';

const FriendPage = () => {
  const router = useRouter();
  const [page] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const clearColorSchemeOverride = useClearAppColorSchemeOverride();

  const { data: requests = [], refetch: refetchRequests } =
    useFetchFriendRequestsQuery(page);
  const {
    data: friends,
    isLoading,
    refetch: refetchFriends,
  } = useFetchFriendsQuery({ page, keyword: '' });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([refetchFriends(), refetchRequests()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFriends, refetchRequests]);

  useFocusEffect(
    useCallback(() => {
      clearColorSchemeOverride();
    }, [clearColorSchemeOverride]),
  );

  const handleOpenFriend = useCallback(
    (friend: Friend) => {
      router.push(
        `/modal?type=friend-routines&friendId=${friend.friendId}&friendNickname=${encodeURIComponent(
          friend.nickname,
        )}&date=${getWeekMonday(new Date())}`,
      );
    },
    [router],
  );

  return (
    <Container style={styles.container} noPadding>
      <FriendHeader requestCount={requests.length} />

      <ThemeView style={styles.innerContainer}>
        <ThemeView style={styles.summaryRow} transparent>
          <Typography variant="caption1" style={styles.totalText}>
            전체 {friends?.length ?? 0}명
          </Typography>
          <Button
            title="친구 추가"
            variant="ghost"
            size="sm"
            leftIcon={({ color }) => (
              <Ionicons
                name="add"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            onPress={() => setShowAddModal(true)}
            backgroundColor="#111827"
            textColor="#FFFFFF"
            style={styles.addButton}
          />
        </ThemeView>

        <FriendList
          friends={friends}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onOpenFriend={handleOpenFriend}
        />
      </ThemeView>

      <FriendAddModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </Container>
  );
};

export default FriendPage;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing[5],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.foundation.spacing[3],
  },
  addButton: {
    width: baseFoundation.dimension.x99,
    height: baseFoundation.dimension.x32,
    minWidth: baseFoundation.dimension.x99,
    minHeight: baseFoundation.dimension.x32,
    borderRadius: baseFoundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[3],
  },
  totalText: {
    color: theme.colors.text.muted,
    fontSize: theme.foundation.typography.size.caption1,
  },
}));
