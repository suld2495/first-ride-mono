import Ionicons from '@expo/vector-icons/Ionicons';
import { useDeleteFriendMutation } from '@repo/shared/hooks/useFriend';
import type { Friend } from '@repo/types';
import { useCallback } from 'react';
import { Alert, FlatList, Pressable } from 'react-native';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FlashList } from '@/components/ui/flash-list';
import { Loading } from '@/components/ui/loading';
import { PixelCard } from '@/components/ui/pixel-card';
import { Typography } from '@/components/ui/typography';
import ThemeView from '@/components/ui/theme-view';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

interface FriendItemProps extends Friend {
  onDelete: () => void;
  onOpen: (friend: Friend) => void;
}

interface FriendRenderItemProps {
  item: Friend;
}

const FRIEND_ITEM_HEIGHT = 88;
const getFriendItemLayout = (
  _: ArrayLike<Friend> | Friend[] | null | undefined,
  index: number,
) => ({
  length: FRIEND_ITEM_HEIGHT,
  offset: FRIEND_ITEM_HEIGHT * index,
  index,
});

const FriendItem = ({ onDelete, onOpen, ...friend }: FriendItemProps) => {
  const deleteMutation = useDeleteFriendMutation();
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const { nickname } = friend;

  const handleDelete = () => {
    Alert.alert(
      '친구 삭제',
      `${nickname}님을 친구 목록에서 삭제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(nickname, {
              onSuccess: () => {
                showToast('삭제되었습니다.', 'success');
                onDelete();
              },
              onError: (err) => {
                const errorMessage = getApiErrorMessage(
                  err,
                  '친구 삭제에 실패했습니다. 다시 시도해주세요.',
                );

                showToast(errorMessage, 'error');
              },
            });
          },
        },
      ],
    );
  };

  return (
    <PixelCard style={styles.card}>
      <ThemeView style={styles.cardInner} transparent>
        <Pressable
          style={styles.friendInfo}
          onPress={() => onOpen(friend)}
          accessibilityRole="button"
          accessibilityLabel={`${nickname} 루틴 보기`}
        >
          <ThemeView style={styles.avatar}>
            <Ionicons
              name="person"
              size={baseFoundation.iconSize.m}
              color={theme.colors.action.secondary.label}
            />
          </ThemeView>
          <Typography variant="body" style={styles.nickname}>
            {nickname}
          </Typography>
        </Pressable>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={() => (
            <Ionicons
              name="trash-outline"
              size={baseFoundation.iconSize.m}
              color={theme.colors.text.tertiary}
            />
          )}
          onPress={handleDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteButton}
        />
      </ThemeView>
    </PixelCard>
  );
};

interface FriendListProps {
  friends?: Friend[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onDeleteRefresh: () => Promise<unknown>;
  onOpenFriend: (friend: Friend) => void;
}

const FriendList = ({
  friends,
  isLoading,
  refreshing,
  onRefresh,
  onDeleteRefresh,
  onOpenFriend,
}: FriendListProps) => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const handleDelete = useCallback(() => {
    return onDeleteRefresh();
  }, [onDeleteRefresh]);

  const renderFriendItem = useCallback(
    ({ item }: FriendRenderItemProps) => (
      <FriendItem {...item} onDelete={handleDelete} onOpen={onOpenFriend} />
    ),
    [handleDelete, onOpenFriend],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!friends || friends.length === 0) {
    return <EmptyState icon="people-outline" message="친구를 추가해보세요." />;
  }

  const ListComponent = isTestEnv ? FlatList<Friend> : FlashList<Friend>;

  return (
    <ListComponent
      data={friends}
      keyExtractor={(item) => item.nickname}
      renderItem={renderFriendItem}
      contentContainerStyle={styles.listContent}
      style={styles.list}
      refreshing={refreshing}
      onRefresh={onRefresh}
      estimatedItemSize={72}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={getFriendItemLayout}
    />
  );
};

export default FriendList;

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: theme.foundation.spacing.m,
    gap: theme.foundation.spacing.s,
  },
  card: {
    marginVertical: baseFoundation.spacing.none,
    padding: baseFoundation.spacing.none, // Remove padding from card as inner content has it or PixelCard has it
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing.m,
  },
  avatar: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
    borderRadius: baseFoundation.dimension.x20,
    backgroundColor: theme.colors.action.secondary.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nickname: {
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingHorizontal: theme.foundation.spacing.s,
  },
}));
