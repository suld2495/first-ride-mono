import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
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
import PixelText from '../common/PixelText';
import ThemeView from '../common/ThemeView';

interface UserItemProps extends User {
  close: () => void;
}

const UserItem = ({ nickname, close }: UserItemProps) => {
  const addMutation = useAddFriendMutation();
  const { showToast } = useToast();

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync(nickname);
      showToast('친구 요청을 보냈습니다.', 'success');
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
      <PixelText variant="body">{nickname}</PixelText>
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
            <KeyboardAwareFlatList
              data={userList ?? []}
              keyExtractor={(item) => item.userId.toString()}
              renderItem={({ item }) => (
                <UserItem {...item} close={handleClose} />
              )}
              ItemSeparatorComponent={() => <Divider />}
              ListHeaderComponent={
                <>
                  <ThemeView style={styles.modalHeader} transparent>
                    <PixelText variant="subtitle">친구 추가</PixelText>
                    <Button
                      variant="ghost"
                      leftIcon={({ color }) => (
                        <Ionicons
                          name="close-outline"
                          size={24}
                          color={color}
                        />
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
                </>
              }
              ListEmptyComponent={
                <ThemeView style={styles.emptyContainer} transparent>
                  <PixelText variant="body" style={styles.emptyText}>
                    유저가 존재하지 않습니다.
                  </PixelText>
                </ThemeView>
              }
              contentContainerStyle={{ flexGrow: 1 }}
              enableOnAndroid={true}
              keyboardShouldPersistTaps="handled"
              enableResetScrollToCoords={false}
            />
          </ThemeView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default FriendAddModal;

const styles = StyleSheet.create((theme) => ({
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
    borderRadius: 4,
    borderWidth: 3,
    padding: theme.foundation.spacing.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.foundation.spacing.m,
  },
  searchContainer: {
    marginBottom: theme.foundation.spacing.m,
  },
  userItem: {
    paddingVertical: theme.foundation.spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    paddingHorizontal: theme.foundation.spacing.s,
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
}));
