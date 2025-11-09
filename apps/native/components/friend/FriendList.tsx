import { StyleSheet, View, FlatList, Alert } from 'react-native';
import {
  useDeleteFriendMutation,
  useFetchFriendsQuery,
} from '@repo/shared/hooks/useFriend';
import { Friend, SearchOption } from '@repo/types';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import Button from '../common/Button';
import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';
import { getApiErrorMessage } from '@/utils/error-utils';

interface FriendItemProps extends Friend {
  onDelete: () => void;
}

const FriendItem = ({ nickname, onDelete }: FriendItemProps) => {
  const deleteMutation = useDeleteFriendMutation();
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleDelete = async () => {
    Alert.alert('친구 삭제', `${nickname}님을 친구 목록에서 삭제하시겠습니까?`, [
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
            Alert.alert('성공', '삭제되었습니다.');
            onDelete();
          } catch (err) {
            const errorMessage = getApiErrorMessage(
              err,
              '친구 삭제에 실패했습니다. 다시 시도해주세요.',
            );

            Alert.alert('오류', errorMessage);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.friendItem}>
      <ThemeText>{nickname}</ThemeText>
      <Button
        variant="plain"
        size="small"
        icon={
          <Ionicons
            name="trash-outline"
            size={16}
            color={COLORS[colorScheme].error}
          />
        }
        onPress={handleDelete}
        style={styles.deleteButton}
      />
    </View>
  );
};

const FriendList = ({ page, keyword }: SearchOption) => {
  const { data: friends, refetch } = useFetchFriendsQuery({ page, keyword });
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleDelete = () => {
    refetch();
  };

  if (!friends || friends.length === 0) {
    return (
      <ThemeView style={styles.emptyContainer}>
        <ThemeText style={styles.emptyText}>친구를 추가해보세요.</ThemeText>
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
      style={styles.list}
    />
  );
};

export default FriendList;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    friendItem: {
      height: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: COLORS[colorScheme].text,
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
