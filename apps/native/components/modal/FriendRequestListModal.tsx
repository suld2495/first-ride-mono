import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import {
  useAcceptFriendRequestMutation,
  useFetchFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@repo/shared/hooks/useFriend';
import { getFormatDate } from '@repo/shared/utils';
import { FriendRequest } from '@repo/types';

import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';

import { Button } from '../common/Button';
import { Divider } from '../common/Divider';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface NotificationContentProps extends FriendRequest {
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

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
        <Typography color="bodySecondary" style={styles.senderNickname}>
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
        <Typography color="bodySecondary" style={styles.dateText}>
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

  const handleAccept = async (id: number) => {
    try {
      await acceptFriendMutation.mutateAsync(id);
      showToast('추가 되었습니다.', 'success');
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '친구 요청 수락에 실패했습니다. 다시 시도해주세요.',
      );

      showToast(errorMessage, 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectFriendRequestMutation.mutateAsync(id);
      showToast('거절 되었습니다.', 'success');
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '친구 요청 거절에 실패했습니다. 다시 시도해주세요.',
      );

      showToast(errorMessage, 'error');
    }
  };

  if (!list || list.length === 0) {
    return (
      <ThemeView style={styles.emptyContainer}>
        <Typography color="bodySecondary">친구 요청이 없습니다.</Typography>
      </ThemeView>
    );
  }

  return (
    <ThemeView style={styles.container}>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationContent
            onAccept={handleAccept}
            onReject={handleReject}
            {...item}
          />
        )}
        ItemSeparatorComponent={() => <Divider spacing={12} />}
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
