import {
  useAcceptFriendRequestMutation,
  useFetchFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from '@repo/shared/hooks/useFriend';
import { useFetchUserListQuery } from '@repo/shared/hooks/useUser';
import { getFormatDate } from '@repo/shared/utils';
import type { FriendRequest } from '@repo/types';
import { useCallback, useState } from 'react';
import { Image, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlashList } from '@/components/ui/flash-list';
import { getRoutineSceneRemoteAsset } from '@/components/routine/routine-scene-art';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useToast } from '@/contexts/ToastContext';
import { useAuthUser } from '@/hooks/useAuthSession';
import { baseFoundation, palette } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

interface NotificationContentProps extends FriendRequest {
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
}

interface FriendRequestRenderItemProps {
  item: FriendRequest;
}

const FRIEND_REQUEST_ITEM_HEIGHT = 56;
const PREVIEW_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 1,
    senderNickname: '민지',
    senderCharacterImageUrl: '/assets/characters/warrior_female_beginner.png',
    receiverNickname: '나',
    status: 'PENDING',
    createdAt: new Date('2026-08-27T09:30:00+09:00'),
  },
];
const IS_FRIEND_REQUEST_PREVIEW =
  __DEV__ && process.env.EXPO_PUBLIC_FRIEND_REQUEST_PREVIEW === '1';
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
  senderCharacterImageUrl,
  receiverCharacterImageUrl,
  receiverBackgroundImageUrl,
  createdAt,
  onAccept,
  onReject,
}: NotificationContentProps) => {
  const { data: searchResults } = useFetchUserListQuery({
    page: 1,
    keyword:
      senderCharacterImageUrl || receiverCharacterImageUrl
        ? ''
        : senderNickname,
  });
  const senderProfile = searchResults?.find(
    (user) => user.nickname === senderNickname,
  );
  const characterAsset = getRoutineSceneRemoteAsset(
    senderCharacterImageUrl ??
      receiverCharacterImageUrl ??
      senderProfile?.characterImageUrl,
  );
  const backgroundAsset = getRoutineSceneRemoteAsset(
    receiverBackgroundImageUrl,
  );

  return (
    <ThemeView style={styles.notificationRow} transparent>
      <View style={styles.avatar}>
        {backgroundAsset?.source ? (
          <Image
            source={backgroundAsset.source}
            style={styles.avatarBackgroundImage}
            resizeMode="cover"
          />
        ) : null}
        {characterAsset?.source ? (
          <Image
            source={characterAsset.source}
            style={styles.avatarImage}
            resizeMode="contain"
            accessibilityLabel={`${senderNickname} 캐릭터`}
          />
        ) : null}
      </View>
      <ThemeView style={styles.notificationContent} transparent>
        <ThemeView style={styles.notificationHeader} transparent>
          <Typography style={styles.senderNickname}>
            {senderNickname}
          </Typography>
          <ThemeView style={styles.buttonContainer} transparent>
            <Button
              title="거절"
              size="sm"
              variant="outline"
              textColor={palette.theme.gray[90]}
              onPress={() => onReject(id)}
              style={styles.rejectButton}
            />
            <Button
              title="추가"
              size="sm"
              variant="ghost"
              backgroundColor={palette.theme.gray[90]}
              textColor={palette.white}
              onPress={() => onAccept(id)}
              style={styles.acceptButton}
            />
          </ThemeView>
        </ThemeView>
        <ThemeView style={styles.notificationFooter} transparent>
          <Typography style={styles.dateText}>
            {getFormatDate(createdAt)}
          </Typography>
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

const FriendRequestListModal = () => {
  const [page] = useState(1);
  const [hiddenPreviewRequestIds, setHiddenPreviewRequestIds] = useState<
    number[]
  >([]);
  const user = useAuthUser();
  const userId = user?.userId ?? '';
  const { data: fetchedList } = useFetchFriendRequestsQuery(userId, page);
  const acceptFriendMutation = useAcceptFriendRequestMutation(userId);
  const rejectFriendRequestMutation = useRejectFriendRequestMutation(userId);
  const { showToast } = useToast();
  const previewList = IS_FRIEND_REQUEST_PREVIEW
    ? PREVIEW_FRIEND_REQUESTS.filter(
        (request) => !hiddenPreviewRequestIds.includes(request.id),
      )
    : undefined;
  const list = previewList ?? fetchedList;

  const hidePreviewRequest = useCallback((id: number) => {
    setHiddenPreviewRequestIds((requestIds) =>
      requestIds.includes(id) ? requestIds : [...requestIds, id],
    );
  }, []);

  const handleAccept = useCallback(
    (id: number) => {
      if (IS_FRIEND_REQUEST_PREVIEW) {
        hidePreviewRequest(id);
        showToast('추가 되었습니다.', 'success');
        return;
      }

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
    [acceptFriendMutation, hidePreviewRequest, showToast],
  );

  const handleReject = useCallback(
    (id: number) => {
      if (IS_FRIEND_REQUEST_PREVIEW) {
        hidePreviewRequest(id);
        showToast('거절 되었습니다.', 'success');
        return;
      }

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
    [hidePreviewRequest, rejectFriendRequestMutation, showToast],
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
        ItemSeparatorComponent={() => (
          <Divider spacing={baseFoundation.spacing[3]} />
        )}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={getFriendRequestItemLayout}
      />
    </ThemeView>
  );
};

export default FriendRequestListModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingVertical: theme.foundation.spacing[4],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[3],
  },
  avatar: {
    width: theme.foundation.dimension.x48,
    height: theme.foundation.dimension.x48,
    borderRadius: theme.foundation.dimension.x24,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  avatarImage: {
    width: theme.foundation.dimension.x48,
    height: theme.foundation.dimension.x60,
  },
  avatarBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  senderNickname: {
    color: theme.colors.text.muted,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.foundation.spacing[2],
  },
  rejectButton: {
    backgroundColor: palette.white,
    borderColor: palette.theme.gray[90],
    borderRadius: theme.foundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[2],
  },
  acceptButton: {
    borderRadius: theme.foundation.radii.xs,
    paddingHorizontal: theme.foundation.spacing[2],
  },
  notificationFooter: {
    position: 'absolute',
    top: theme.foundation.spacing[5] + theme.foundation.spacing[0.5],
    left: theme.foundation.spacing[0],
    right: theme.foundation.spacing[0],
  },
  dateText: {
    color: theme.colors.text.muted,
    fontSize: theme.foundation.typography.size.s,
  },
}));
