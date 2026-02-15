import { Alert, FlatList } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  useDeleteFriendMutation,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { Friend, SearchOption } from '@repo/types';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { PixelCard } from '../common/PixelCard';
import { PixelText } from '../common/PixelText';
import ThemeView from '../common/ThemeView';

interface FriendItemProps extends Friend {
  onDelete: () => void;
}

const FriendItem = ({ nickname, onDelete }: FriendItemProps) => {
  const deleteMutation = useDeleteFriendMutation();
  const { theme } = useUnistyles();
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

  const handleDelete = () => {
    refetch();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!friends || friends.length === 0) {
    return <EmptyState icon="people-outline" message="친구를 추가해보세요." />;
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.nickname}
      renderItem={({ item }) => (
        <FriendItem {...item} onDelete={handleDelete} />
      )}
      contentContainerStyle={styles.listContent}
      style={styles.list}
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
