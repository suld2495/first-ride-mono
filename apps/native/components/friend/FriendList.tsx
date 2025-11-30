import { Alert, FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { feedbackColors } from '@repo/design-system';
import {
  useDeleteFriendMutation,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { Friend, SearchOption } from '@repo/types';

import { useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getApiErrorMessage } from '@/utils/error-utils';

import { Button } from '../common/Button';
import { Divider } from '../common/Divider';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface FriendItemProps extends Friend {
  onDelete: () => void;
}

const FriendItem = ({ nickname, onDelete }: FriendItemProps) => {
  const deleteMutation = useDeleteFriendMutation();
  const colorScheme = useColorScheme();
  const { showToast } = useToast();

  const handleDelete = async () => {
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
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(nickname);
              showToast('삭제되었습니다.', 'success');
              onDelete();
            } catch (err) {
              const errorMessage = getApiErrorMessage(
                err,
                '친구 삭제에 실패했습니다. 다시 시도해주세요.',
              );

              showToast(errorMessage, 'error');
            }
          },
        },
      ],
    );
  };

  return (
    <ThemeView style={styles.friendItem}>
      <Typography>{nickname}</Typography>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={() => (
          <Ionicons
            name="trash-outline"
            size={16}
            color={feedbackColors.error.icon[colorScheme]}
          />
        )}
        onPress={handleDelete}
        style={styles.deleteButton}
      />
    </ThemeView>
  );
};

const FriendList = ({ page, keyword }: SearchOption) => {
  const { data: friends, refetch } = useFetchFriendsQuery({ page, keyword });

  const handleDelete = () => {
    refetch();
  };

  if (!friends || friends.length === 0) {
    return (
      <ThemeView style={styles.emptyContainer}>
        <Typography style={styles.emptyText}>친구를 추가해보세요.</Typography>
      </ThemeView>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.nickname}
      renderItem={({ item }) => (
        <FriendItem {...item} onDelete={handleDelete} />
      )}
      ItemSeparatorComponent={() => <Divider />}
      style={styles.list}
    />
  );
};

export default FriendList;

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  friendItem: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    paddingHorizontal: 8,
  },
  emptyContainer: {
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
});
