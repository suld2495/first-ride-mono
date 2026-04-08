import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useDeleteFriendMutation,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import type { Friend, SearchOption } from '@repo/types';
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FlashList } from '@/components/ui/flash-list';
import { Loading } from '@/components/ui/loading';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

interface FriendItemProps extends Friend {
  onDelete: () => void;
}

interface FriendRenderItemProps {
  item: Friend;
}

const FRIEND_ITEM_HEIGHT = 88;
const getFriendItemLayout = (_: Friend[] | null, index: number) => ({
  length: FRIEND_ITEM_HEIGHT,
  offset: FRIEND_ITEM_HEIGHT * index,
  index,
});

const FriendItem = ({ nickname, onDelete }: FriendItemProps) => {
  const deleteMutation = useDeleteFriendMutation();
  const { theme } = useUnistyles();
  const { showToast } = useToast();

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
        <ThemeView style={styles.friendInfo} transparent>
          <ThemeView style={styles.avatar}>
            <Ionicons
              name="person"
              size={20}
              color={theme.colors.action.secondary.label}
            />
          </ThemeView>
          <PixelText variant="body" style={styles.nickname}>
            {nickname}
          </PixelText>
        </ThemeView>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={() => (
            <Ionicons
              name="trash-outline"
              size={20}
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

const FriendList = ({ page, keyword }: SearchOption) => {
  const {
    data: friends,
    isLoading,
    refetch,
  } = useFetchFriendsQuery({ page, keyword });

  const handleDelete = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderFriendItem = useCallback(
    ({ item }: FriendRenderItemProps) => (
      <FriendItem {...item} onDelete={handleDelete} />
    ),
    [handleDelete],
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!friends || friends.length === 0) {
    return <EmptyState icon="people-outline" message="친구를 추가해보세요." />;
  }

  return (
    <FlashList
      data={friends}
      keyExtractor={(item) => item.nickname}
      renderItem={renderFriendItem}
      contentContainerStyle={styles.listContent}
      style={styles.list}
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
    marginVertical: 0,
    padding: 0, // Remove padding from card as inner content has it or PixelCard has it
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
