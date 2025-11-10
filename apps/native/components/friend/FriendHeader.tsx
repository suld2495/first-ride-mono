import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  useAcceptFriendRequestMutation,
  useFetchFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@repo/shared/hooks/useFriend';
import { getFormatDate } from '@repo/shared/utils';
import { FriendRequest } from '@repo/types';

import Button from '../common/Button';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';
import NotificationBell from '../notification/NotificationBell';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/error-utils';
import { COLORS } from '@/theme/colors';

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
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.notificationContent}>
      <View style={styles.notificationHeader}>
        <ThemeText style={styles.senderNickname}>{senderNickname}</ThemeText>
        <View style={styles.buttonContainer}>
          <Button
            title="추가"
            size="very-small"
            variant="primary"
            onPress={() => onAccept(id)}
            style={styles.acceptButton}
          />
          <Button
            title="거절"
            size="very-small"
            variant="danger"
            onPress={() => onReject(id)}
            style={styles.rejectButton}
          />
        </View>
      </View>
      <View style={styles.notificationFooter}>
        <ThemeText style={styles.dateText}>{getFormatDate(createdAt)}</ThemeText>
      </View>
    </View>
  );
};

const FriendHeader = () => {
  const [page] = useState(1);
  const { data: list } = useFetchFriendRequestsQuery(page);
  const acceptFriendMutation = useAcceptFriendRequestMutation();
  const rejectFriendRequestMutation = useRejectFriendRequestMutation();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

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

  if (!list) {
    return null;
  }

  return (
    <ThemeView style={styles.header}>
      <ThemeText variant="title">친구 리스트</ThemeText>
      <View style={styles.headerRight}>
        <NotificationBell
          list={list.map((item) => ({
            ...item,
            title: item.senderNickname,
          }))}
          renderItem={(item) => (
            <NotificationContent
              onAccept={handleAccept}
              onReject={handleReject}
              {...item}
            />
          )}
        />
      </View>
    </ThemeView>
  );
};

export default FriendHeader;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS[colorScheme].border,
    },
    headerRight: {
      flexDirection: 'row',
      gap: 12,
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
      color: COLORS[colorScheme].textSecondary,
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
      color: COLORS[colorScheme].textSecondary,
    },
  });
