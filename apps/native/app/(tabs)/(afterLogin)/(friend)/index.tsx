import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useFetchFriendRequestsQuery,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { getWeekMonday } from '@repo/shared/utils';
import type { Friend } from '@repo/types';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import FriendAddModal from '@/components/friend/friend-add-modal';
import FriendHeader from '@/components/friend/friend-header';
import FriendList from '@/components/friend/friend-list';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { baseFoundation } from '@/theme/tokens';

const getFriendAccountId = (friend: Friend): number | string | undefined =>
  friend.id ?? friend.friendId ?? friend.accountId;

const FriendPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [page] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleOpenFriend = useCallback(
    (friend: Friend) => {
      const friendAccountId = getFriendAccountId(friend);

      if (!friendAccountId) {
        showToast(
          '친구 루틴을 보려면 친구 목록 응답에 친구 id가 필요합니다.',
          'error',
        );
        return;
      }

      router.push(
        `/modal?type=friend-routines&friendId=${friendAccountId}&friendNickname=${encodeURIComponent(
          friend.nickname,
        )}&date=${getWeekMonday(new Date())}`,
      );
    },
    [router, showToast],
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
