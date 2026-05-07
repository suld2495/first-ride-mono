import {
  useFetchFriendRequestsQuery,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Friend } from '@repo/types';
import { getWeekMonday } from '@repo/shared/utils';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import FriendAddModal from '@/components/friend/friend-add-modal';
import FriendHeader from '@/components/friend/friend-header';
import FriendList from '@/components/friend/friend-list';
import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeView from '@/components/ui/theme-view';
import { useToast } from '@/contexts/ToastContext';

const getFriendAccountId = (friend: Friend): number | string | undefined =>
  friend.id ?? friend.userId ?? friend.friendId ?? friend.accountId;

const FriendPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [page] = useState(1);
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: requests = [], refetch: refetchRequests } =
    useFetchFriendRequestsQuery(page);
  const {
    data: friends,
    isLoading,
    refetch: refetchFriends,
  } = useFetchFriendsQuery({ page, keyword });

  const handleSearch = () => {
    setKeyword(input);
  };

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
      <Header />
      <FriendHeader requestCount={requests.length} />

      <ThemeView style={styles.innerContainer}>
        <ThemeView style={styles.addButtonContainer}>
          <Button
            title="친구 추가"
            variant="primary"
            size="sm"
            leftIcon={({ color }) => (
              <Ionicons
                name="people-outline"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </ThemeView>

        <ThemeView style={styles.searchContainer}>
          <Input
            value={input}
            placeholder="이름을 입력해주세요."
            onChangeText={setInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            fullWidth
          />
        </ThemeView>
        <FriendList
          friends={friends}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onDeleteRefresh={refetchFriends}
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
    paddingHorizontal: theme.foundation.spacing[4],
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.foundation.spacing[4],
  },
  addButton: {
    paddingHorizontal: theme.foundation.spacing[2],
  },
  searchContainer: {
    marginVertical: theme.foundation.spacing[4],
  },
  searchInput: {
    width: '100%',
  },
}));
