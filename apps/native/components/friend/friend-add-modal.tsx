import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddFriendMutation } from '@repo/shared/hooks/useFriend';
import { useFetchUserListQuery } from '@repo/shared/hooks/useUser';
import type { SearchOption, User } from '@repo/types';
import { useCallback, useState } from 'react';
import { Modal, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlashList } from '@/components/ui/flash-list';
import { Input } from '@/components/ui/input';
import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

interface UserItemProps extends User {
  close: () => void;
}

interface UserRenderItemProps {
  item: User;
}

const USER_ITEM_HEIGHT = 73;
const getUserItemLayout = (_: User[] | null, index: number) => ({
  length: USER_ITEM_HEIGHT,
  offset: USER_ITEM_HEIGHT * index,
  index,
});

const UserItem = ({ nickname, close }: UserItemProps) => {
  const addMutation = useAddFriendMutation();
  const { showToast } = useToast();

  const handleAdd = () => {
    addMutation.mutate(nickname, {
      onSuccess: () => {
        showToast('친구 요청을 보냈습니다.', 'success');
        close();
      },
      onError: (err) => {
        const errorMessage = getApiErrorMessage(
          err,
          '친구 추가에 실패했습니다. 다시 시도해주세요.',
        );

        showToast(errorMessage, 'error');
      },
    });
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
  const { theme } = useUnistyles();
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

  const handleClose = useCallback(() => {
    setKeyword('');
    setSearchOption({ page: 1, keyword: '' });
    onClose();
  }, [onClose]);

  const renderUserItem = useCallback(
    ({ item }: UserRenderItemProps) => (
      <UserItem {...item} close={handleClose} />
    ),
    [handleClose],
  );

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
            <FlashList
              data={userList ?? []}
              keyExtractor={(item) => item.userId.toString()}
              renderItem={renderUserItem}
              ItemSeparatorComponent={() => <Divider />}
              ListHeaderComponent={
                <>
                  <ThemeView style={styles.modalHeader} transparent>
                    <PixelText variant="subtitle">친구 추가</PixelText>
                    <Pressable
                      onPress={handleClose}
                      hitSlop={8}
                      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                      <Ionicons
                        name="close-outline"
                        size={24}
                        color={theme.colors.text.primary}
                      />
                    </Pressable>
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
              keyboardShouldPersistTaps="handled"
              estimatedItemSize={72}
              removeClippedSubviews
              maxToRenderPerBatch={10}
              windowSize={5}
              getItemLayout={getUserItemLayout}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker overlay for better contrast
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.foundation.radii.xl,
    padding: theme.foundation.spacing.l,
    shadowColor: theme.colors.border.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
    maxHeight: 500, // Limit height to avoid taking up full screen if list is long
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.foundation.spacing.l,
    marginHorizontal: -theme.foundation.spacing.s, // Pull header closer to edges
    paddingHorizontal: theme.foundation.spacing.s,
  },
  searchContainer: {
    marginBottom: theme.foundation.spacing.m,
  },
  userItem: {
    paddingVertical: theme.foundation.spacing.m,
    paddingHorizontal: theme.foundation.spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.sunken,
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
