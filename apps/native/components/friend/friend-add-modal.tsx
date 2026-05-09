import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddFriendMutation } from '@repo/shared/hooks/useFriend';
import { useFetchUserListQuery } from '@repo/shared/hooks/useUser';
import type { SearchOption, User } from '@repo/types';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { FlashList } from '@/components/ui/flash-list';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

interface UserItemProps extends User {
  close: () => void;
  itemStyle?: StyleProp<ViewStyle>;
}

interface UserRenderItemProps {
  item: User;
  index: number;
}

const UserItem = ({ nickname, userId, close, itemStyle }: UserItemProps) => {
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
    <ThemeView style={[styles.userItem, itemStyle]} transparent>
      <View style={styles.userProfile}>
        <View style={styles.avatar} />
        <View style={styles.userTextGroup}>
          <Typography
            variant="body2"
            weight="semibold"
            style={styles.nickname}
            numberOfLines={1}
          >
            {nickname}
          </Typography>
          <Typography
            variant="caption1"
            style={styles.userId}
            numberOfLines={1}
          >
            {userId}
          </Typography>
        </View>
      </View>
      <Button
        title="친구 신청"
        variant="outline"
        size="sm"
        textColor={palette.theme.gray[90]}
        onPress={handleAdd}
        style={styles.addButton}
        textStyle={styles.addButtonText}
      />
    </ThemeView>
  );
};

interface FriendAddModalProps {
  visible: boolean;
  onClose: () => void;
}

const FriendAddModal = ({ visible, onClose }: FriendAddModalProps) => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchOption, setSearchOption] = useState<SearchOption>({
    page: 1,
    keyword: '',
  });

  const { data: userList, refetch } = useFetchUserListQuery(searchOption);

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
    ({ item, index }: UserRenderItemProps) => {
      const isLastItem = index === (userList?.length ?? 0) - 1;

      return (
        <UserItem
          {...item}
          close={handleClose}
          itemStyle={isLastItem ? undefined : styles.userItemGap}
        />
      );
    },
    [handleClose, userList?.length],
  );

  const handleRefresh = useCallback(async () => {
    if (!searchOption.keyword) return;

    setRefreshing(true);

    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, searchOption.keyword]);

  const ListComponent = isTestEnv ? FlatList<User> : FlashList<User>;

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
          <ThemeView style={styles.modalContent} variant="elevated">
            <ThemeView style={styles.modalHeader} transparent>
              <Typography
                variant="body1"
                weight="semibold"
                style={styles.modalTitle}
              >
                친구 추가
              </Typography>
              <Pressable
                onPress={handleClose}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
              >
                <Ionicons
                  name="close-outline"
                  size={baseFoundation.iconSize.l}
                  color="#17181C"
                />
              </Pressable>
            </ThemeView>

            <ThemeView style={styles.searchRow} transparent>
              <View style={styles.searchInputWrapper}>
                <Input
                  placeholder="유저이름을 입력해주세요."
                  value={keyword}
                  onChangeText={setKeyword}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  size="sm"
                  fullWidth
                  style={styles.searchInput}
                  color="title"
                  placeholderTextColor={palette.theme.gray[10]}
                />
              </View>
              <Button
                title="검색"
                variant="ghost"
                size="sm"
                onPress={handleSearch}
                backgroundColor="#17181C"
                textColor="#FFFFFF"
                style={styles.searchButton}
                textStyle={styles.searchButtonText}
              />
            </ThemeView>

            <ThemeView style={styles.listContainer} transparent>
              <ListComponent
                data={userList ?? []}
                keyExtractor={(item) => item.userId.toString()}
                renderItem={renderUserItem}
                ListEmptyComponent={
                  <ThemeView style={styles.emptyContainer} transparent>
                    <Typography variant="body3" style={styles.emptyText}>
                      유저가 존재하지 않습니다.
                    </Typography>
                  </ThemeView>
                }
                contentContainerStyle={
                  userList?.length ? styles.listContent : styles.emptyListContent
                }
                keyboardShouldPersistTaps="handled"
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
                estimatedItemSize={48}
                removeClippedSubviews={false}
                maxToRenderPerBatch={10}
                windowSize={5}
                showsVerticalScrollIndicator={false}
                style={styles.list}
              />
            </ThemeView>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '86%',
    maxWidth: 360,
    maxHeight: '74%',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.foundation.radii.s,
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: theme.foundation.spacing[5],
    shadowColor: '#000000',
    shadowOffset: {
      width: baseFoundation.dimension.x0,
      height: baseFoundation.dimension.x4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 436,
    maxHeight: 560,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.foundation.spacing[5],
    paddingRight: theme.foundation.spacing[5],
    paddingVertical: 17,
  },
  modalTitle: {
    color: palette.theme.gray[90],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1.5],
    paddingHorizontal: theme.foundation.spacing[5],
  },
  searchInput: {
    height: baseFoundation.dimension.x32,
    marginVertical: theme.foundation.spacing[3],
    borderRadius: baseFoundation.radii.xs,
    borderColor: palette.theme.gray[8],
  },
  searchInputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  searchButton: {
    width: baseFoundation.dimension.x56,
    minWidth: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x32,
    minHeight: baseFoundation.dimension.x32,
    borderRadius: baseFoundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[2],
  },
  searchButtonText: {
    fontSize: theme.foundation.typography.size.body3,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    minHeight: baseFoundation.dimension.x220,
    paddingHorizontal: theme.foundation.spacing[5],
    paddingVertical: theme.foundation.spacing[3],
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.foundation.spacing[1],
  },
  emptyListContent: {
    flexGrow: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[3],
  },
  userItemGap: {
    marginBottom: theme.foundation.spacing[3],
  },
  userProfile: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  avatar: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.radii.round,
    backgroundColor: '#8DB9DC',
  },
  userTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: baseFoundation.dimension.x3,
  },
  nickname: {
    color: palette.theme.gray[80],
    lineHeight: 19,
  },
  userId: {
    color: palette.theme.gray[10],
    lineHeight: 17,
  },
  addButton: {
    width: 83,
    minWidth: 83,
    height: baseFoundation.dimension.x32,
    minHeight: baseFoundation.dimension.x32,
    borderRadius: baseFoundation.radii.xs,
    borderColor: palette.theme.gray[90],
    paddingHorizontal: theme.foundation.spacing[2],
  },
  addButtonText: {
    color: palette.theme.gray[90],
    fontSize: theme.foundation.typography.size.body3,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    minHeight: baseFoundation.dimension.x140,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: palette.theme.gray[10],
    textAlign: 'center',
  },
}));
