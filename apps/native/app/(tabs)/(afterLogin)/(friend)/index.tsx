import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useFetchFriendRequestsQuery,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { getWeekMonday } from '@repo/shared/utils';
import type { Friend } from '@repo/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';

import FriendAddModal from '@/components/friend/friend-add-modal';
import FriendHeader from '@/components/friend/friend-header';
import FriendList from '@/components/friend/friend-list';
import RandomFriendRecommendation from '@/components/friend/random-friend-recommendation';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import {
  useBaseColorSchemeValue,
  useClearAppColorSchemeOverride,
} from '@/hooks/useThemePreference';
import { appThemes } from '@/theme/themes';
import { baseFoundation } from '@/theme/tokens';

const FriendPage = () => {
  const router = useRouter();
  const [page] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthUser();
  const baseThemeName = useBaseColorSchemeValue();
  const clearColorSchemeOverride = useClearAppColorSchemeOverride();
  const pageBackgroundColor = appThemes[baseThemeName].colors.background.base;

  const { data: requests = [], refetch: refetchRequests } =
    useFetchFriendRequestsQuery(user?.userId ?? '', page);
  const {
    data: friends,
    isLoading,
    refetch: refetchFriends,
  } = useFetchFriendsQuery({ page, keyword: '' });

  useLayoutEffect(() => {
    clearColorSchemeOverride();
  }, [clearColorSchemeOverride]);

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
    <Container
      style={[styles.container, { backgroundColor: pageBackgroundColor }]}
      noPadding
      testID="friend-page"
    >
      <FriendHeader requestCount={requests.length} />

      <ThemeView
        style={styles.innerContainer}
        transparent
        testID="friend-page-content"
      >
        <RandomFriendRecommendation />

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
                size={baseFoundation.iconSize.m - 4}
                color={color}
              />
            )}
            onPress={() => setShowAddModal(true)}
            backgroundColor="#111827"
            textColor="#FFFFFF"
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
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
    paddingHorizontal: theme.foundation.spacing[6],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.foundation.spacing[4],
  },
  addButton: {
    height: baseFoundation.dimension.x28,
    minHeight: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[3],
  },
  addButtonContent: {
    gap: baseFoundation.dimension.x2,
  },
  totalText: {
    color: theme.colors.text.muted,
    fontSize: theme.foundation.typography.size.caption1,
  },
}));
