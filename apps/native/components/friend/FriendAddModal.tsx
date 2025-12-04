import { useState } from 'react';
import { FlatList, Modal, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddFriendMutation } from '@repo/shared/hooks/useFriend';
import { useFetchUserListQuery } from '@repo/shared/hooks/useUser';
import { SearchOption, User } from '@repo/types';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

import { Button } from '../common/Button';
import { Divider } from '../common/Divider';
import { Input } from '../common/Input';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface UserItemProps extends User {
  close: () => void;
}

const UserItem = ({ nickname, close }: UserItemProps) => {
  const addMutation = useAddFriendMutation();
  const { showToast } = useToast();

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync(nickname);
      showToast('추가되었습니다.', 'success');
      close();
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '친구 추가에 실패했습니다. 다시 시도해주세요.',
      );

      showToast(errorMessage, 'error');
    }
  };

  return (
    <ThemeView style={styles.userItem} transparent>
      <Typography>{nickname}</Typography>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={({ color }) => (
          <Ionicons name="add-outline" size={16} color={color} />
        )}
        onPress={handleAdd}
        style={styles.addButton}
      />
    </ThemeView>
  );
};

interface FriendAddModalProps {
  visible: boolean;
  onClose: () => void;
}

const FriendAddModal = ({ visible, onClose }: FriendAddModalProps) => {
  const [keyword, setKeyword] = useState('');
  const [searchOption, setSearchOption] = useState<SearchOption>({
    page: 1,
    keyword: '',
  });

  const { data: userList } = useFetchUserListQuery(searchOption);

  const handleSearch = () => {
    setSearchOption((option) => ({
      ...option,
      keyword,
    }));
  };

  const handleClose = () => {
    setKeyword('');
    setSearchOption({ page: 1, keyword: '' });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <ThemeView style={styles.modalContent}>
            <ThemeView style={styles.modalHeader} transparent>
              <Typography variant="subtitle">친구 추가</Typography>
              <Button
                variant="ghost"
                leftIcon={({ color }) => (
                  <Ionicons name="close-outline" size={24} color={color} />
                )}
                onPress={handleClose}
              />
            </ThemeView>

            <ThemeView style={styles.searchContainer} transparent>
              <Input
                placeholder="유저이름을 입력해주세요."
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                fullWidth
              />
            </ThemeView>

            <ThemeView style={styles.userListContainer} transparent>
              {userList && userList.length > 0 ? (
                <FlatList
                  data={userList}
                  keyExtractor={(item) => item.userId.toString()}
                  renderItem={({ item }) => (
                    <UserItem {...item} close={handleClose} />
                  )}
                  ItemSeparatorComponent={() => <Divider />}
                />
              ) : (
                <ThemeView style={styles.emptyContainer} transparent>
                  <Typography style={styles.emptyText}>
                    유저가 존재하지 않습니다.
                  </Typography>
                </ThemeView>
              )}
            </ThemeView>
          </ThemeView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FriendAddModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    width: '100%',
  },
  userListContainer: {
    maxHeight: 400,
  },
  userItem: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
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
