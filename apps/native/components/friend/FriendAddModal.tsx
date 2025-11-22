import { useState } from 'react';
import { StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { useAddFriendMutation } from '@repo/shared/hooks/useFriend';
import { useFetchUserListQuery } from '@repo/shared/hooks/useUser';
import { SearchOption, User } from '@repo/types';
import Ionicons from '@expo/vector-icons/Ionicons';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import ThemeTextInput from '../common/ThemeTextInput';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';
import { COLORS } from '@/theme/colors';

interface UserItemProps extends User {
  close: () => void;
}

const UserItem = ({ nickname, close }: UserItemProps) => {
  const addMutation = useAddFriendMutation();
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const styles = createStyles(colorScheme);

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
    <ThemeView style={styles.userItem}>
      <ThemeText>{nickname}</ThemeText>
      <Button
        variant="plain"
        size="small"
        icon={
          <Ionicons
            name="add-outline"
            size={16}
            color={COLORS[colorScheme].primary}
          />
        }
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
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

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
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <ThemeView style={styles.modalContent}>
            <ThemeView style={styles.modalHeader}>
              <ThemeText variant="subtitle">친구 추가</ThemeText>
              <Button
                variant="plain"
                icon={
                  <Ionicons
                    name="close-outline"
                    size={24}
                    color={COLORS[colorScheme].text}
                  />
                }
                onPress={handleClose}
              />
            </ThemeView>

            <ThemeView style={styles.searchContainer}>
              <ThemeTextInput
                placeholder="유저이름을 입력해주세요."
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                style={styles.searchInput}
              />
            </ThemeView>

            <ThemeView style={styles.userListContainer}>
              {userList && userList.length > 0 ? (
                <FlatList
                  data={userList}
                  keyExtractor={(item) => item.userId.toString()}
                  renderItem={({ item }) => (
                    <UserItem {...item} close={handleClose} />
                  )}
                />
              ) : (
                <ThemeView style={styles.emptyContainer}>
                  <ThemeText style={styles.emptyText}>
                    유저가 존재하지 않습니다.
                  </ThemeText>
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

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
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
      borderBottomWidth: 1,
      borderBottomColor: COLORS[colorScheme].text,
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
