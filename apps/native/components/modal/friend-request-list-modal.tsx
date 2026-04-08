import {
  useAcceptFriendRequestMutation,
  useFetchFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@repo/shared/hooks/useFriend';
import { getFormatDate } from '@repo/shared/utils';
import type { FriendRequest } from '@repo/types';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlashList } from '@/components/ui/flash-list';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

interface NotificationContentProps extends FriendRequest {
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

interface FriendRequestRenderItemProps {
  item: FriendRequest;
}

const FRIEND_REQUEST_ITEM_HEIGHT = 56;
const getFriendRequestItemLayout = (
  _: FriendRequest[] | null,
  index: number,
) => ({
  length: FRIEND_REQUEST_ITEM_HEIGHT,
  offset: FRIEND_REQUEST_ITEM_HEIGHT * index,
  index,
});

const NotificationContent = ({
  id,
  senderNickname,
  createdAt,
  onAccept,
  onReject,
}: NotificationContentProps) => {
  return (
    <ThemeView style={styles.notificationContent} transparent>
      <ThemeView style={styles.notificationHeader} transparent>
        <Typography color="secondary" style={styles.senderNickname}>
          {senderNickname}
        </Typography>
        <ThemeView style={styles.buttonContainer} transparent>
          <Button
            title="추가"
            size="sm"
            variant="primary"
            onPress={() => onAccept(id)}
            style={styles.acceptButton}
          />
          <Button
            title="거절"
            size="sm"
            variant="danger"
            onPress={() => onReject(id)}
            style={styles.rejectButton}
          />
        </ThemeView>
      </ThemeView>
      <ThemeView style={styles.notificationFooter} transparent>
        <Typography color="secondary" style={styles.dateText}>
          {getFormatDate(createdAt)}
        </Typography>
      </ThemeView>
    </ThemeView>
  );
};

const FriendRequestListModal = () => {
  const [page] = useState(1);
  const { data: list } = useFetchFriendRequestsQuery(page);
  const acceptFriendMutation = useAcceptFriendRequestMutation();
  const rejectFriendRequestMutation = useRejectFriendRequestMutation();
  const { showToast } = useToast();

  const handleAccept = useCallback(
    (id: number) => {
      acceptFriendMutation.mutate(id, {
        onSuccess: () => {
          showToast('추가 되었습니다.', 'success');
        },
        onError: (err) => {
          const errorMessage = getApiErrorMessage(
            err,
            '친구 요청 수락에 실패했습니다. 다시 시도해주세요.',
          );

          showToast(errorMessage, 'error');
        },
      });
    },
    [acceptFriendMutation, showToast],
  );

  const handleReject = useCallback(
    (id: number) => {
      rejectFriendRequestMutation.mutate(id, {
        onSuccess: () => {
          showToast('거절 되었습니다.', 'success');
        },
        onError: (err) => {
          const errorMessage = getApiErrorMessage(
            err,
            '친구 요청 거절에 실패했습니다. 다시 시도해주세요.',
          );

          showToast(errorMessage, 'error');
        },
      });
    },
    [rejectFriendRequestMutation, showToast],
  );

  const renderNotificationItem = useCallback(
    ({ item }: FriendRequestRenderItemProps) => (
      <NotificationContent
        onAccept={handleAccept}
        onReject={handleReject}
        {...item}
      />
    ),
    [handleAccept, handleReject],
  );

  if (!list || list.length === 0) {
    return (
      <ThemeView style={styles.emptyContainer}>
        <Typography color="secondary">친구 요청이 없습니다.</Typography>
      </ThemeView>
    );
  }

  return (
    <ThemeView style={styles.container}>
      <FlashList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        ItemSeparatorComponent={() => <Divider spacing={12} />}
        estimatedItemSize={72}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={getFriendRequestItemLayout}
      />
    </ThemeView>
  );
};

export default FriendRequestListModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flexDirection: 'column',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  senderNickname: {
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    paddingHorizontal: 8,
  },
  rejectButton: {
    paddingHorizontal: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
});
