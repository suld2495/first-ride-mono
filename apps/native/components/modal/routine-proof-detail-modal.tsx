import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import type { RoutineDetail } from '@repo/types';
import { getFormatDateTime } from '@repo/shared/utils';
import { useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  Pressable,
  ScrollView,
  type StyleProp,
  View,
} from 'react-native';
import * as Svg from 'react-native-svg';

import { getRoutineSceneRemoteAsset } from '@/components/routine/routine-scene-art';
import FullscreenModal from '@/components/ui/fullscreen-modal';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useRequestId } from '@/hooks/useRequestSelection';
import { useRoutineForm } from '@/hooks/useRoutineSelection';
import { baseFoundation } from '@/theme/tokens';

const DETAIL_IMAGE_THUMBNAIL_COUNT = 3;

const getMessageTime = (dateInput?: null | string) => {
  if (!dateInput) return '';

  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) return '';

  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${hour}:${minute}`;
};

type DetailImageProps = {
  imagePath: string;
  style: StyleProp<ImageStyle>;
};

type DetailAvatarProps = {
  imageSource?: ImageSourcePropType;
  nickname: string;
  showNickname?: boolean;
};

const DetailAvatar = ({
  imageSource,
  nickname,
  showNickname = false,
}: DetailAvatarProps) => (
  <View style={styles.chatAvatarGroup}>
    <View style={styles.chatAvatar}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.chatAvatarImage}
          resizeMode="contain"
          accessibilityLabel={`${nickname} 캐릭터`}
        />
      ) : (
        <Typography
          variant="caption2"
          weight="semibold"
          style={styles.chatAvatarText}
        >
          {showNickname ? nickname.slice(0, 1) : nickname}
        </Typography>
      )}
    </View>
    {showNickname ? (
      <Typography
        variant="caption2"
        style={styles.chatAvatarNickname}
        testID={`routine-proof-chat-nickname-${nickname}`}
      >
        {nickname}
      </Typography>
    ) : null}
  </View>
);

const DetailImage = ({ imagePath, style }: DetailImageProps) => {
  if (imagePath.endsWith('svg')) {
    return <Svg.SvgUri uri={imagePath} style={style} />;
  }

  return (
    <Image source={{ uri: imagePath }} style={style} resizeMode="contain" />
  );
};

type RoutineProofDetailModalProps = {
  previewCurrentNickname?: string;
  previewDetail?: RoutineDetail;
};

const RoutineProofDetailModal = ({
  previewCurrentNickname,
  previewDetail,
}: RoutineProofDetailModalProps = {}) => {
  const requestId = useRequestId();
  const { data: fetchedDetail, isLoading } =
    useFetchRequestDetailQuery(requestId);
  const user = useAuthUser();
  const selectedRoutine = useRoutineForm();
  const detail = previewDetail ?? fetchedDetail;
  const imagePaths = useMemo(
    () => detail?.imagePaths?.slice(0, DETAIL_IMAGE_THUMBNAIL_COUNT) ?? [],
    [detail?.imagePaths],
  );
  const [expandedImagePath, setExpandedImagePath] = useState<null | string>(
    null,
  );

  if (isLoading && !previewDetail) return null;

  const routineDescription = detail?.routineDetail?.trim();
  const fallbackRoutineDescription = selectedRoutine.routineDetail?.trim();
  const visibleRoutineDescription =
    routineDescription ?? fallbackRoutineDescription;
  const routineName = detail?.routineName ?? selectedRoutine.routineName;
  const requestMessage = detail?.message?.trim();
  const replyMessage = detail?.checkComment?.trim();
  const isRequesterMe =
    Boolean(previewCurrentNickname ?? user?.nickname) &&
    detail?.requesterNickname === (previewCurrentNickname ?? user?.nickname);
  const requesterAvatarSource = getRoutineSceneRemoteAsset(
    detail?.requesterCharacterImageUrl,
  )?.source;
  const responderAvatarSource = getRoutineSceneRemoteAsset(
    detail?.responderCharacterImageUrl,
  )?.source;
  const messages = [
    requestMessage
      ? {
          id: 'request-message',
          avatarSource:
            isRequesterMe && user?.characterImageUrl
              ? getRoutineSceneRemoteAsset(user.characterImageUrl)?.source
              : requesterAvatarSource,
          text: requestMessage,
          time: getMessageTime(detail?.createdAt),
          mine: isRequesterMe,
          nickname: detail?.requesterNickname ?? '',
        }
      : null,
    replyMessage
      ? {
          id: 'reply-message',
          avatarSource:
            !isRequesterMe && user?.characterImageUrl
              ? getRoutineSceneRemoteAsset(user.characterImageUrl)?.source
              : responderAvatarSource,
          text: replyMessage,
          time: getMessageTime(detail?.checkedAt),
          mine: !isRequesterMe,
          nickname: detail?.responderNickname ?? '',
        }
      : null,
  ].filter(Boolean) as Array<{
    avatarSource?: ImageSourcePropType;
    id: string;
    mine: boolean;
    nickname: string;
    text: string;
    time: string;
  }>;

  return (
    <ThemeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView transparent style={styles.header}>
          <Typography variant="subtitle1" weight="bold" style={styles.title}>
            {routineName}
          </Typography>
          {visibleRoutineDescription ? (
            <Typography variant="body2" style={styles.description}>
              {visibleRoutineDescription}
            </Typography>
          ) : null}
        </ThemeView>

        {imagePaths.length ? (
          <ThemeView transparent style={styles.section}>
            <Typography
              variant="caption1"
              weight="semibold"
              style={styles.sectionTitle}
            >
              인증 사진
            </Typography>
            <View style={styles.imageRow}>
              {Array.from({ length: DETAIL_IMAGE_THUMBNAIL_COUNT }).map(
                (_, index) => {
                  const imagePath = imagePaths[index];

                  return imagePath ? (
                    <Pressable
                      key={`${imagePath}-${index}`}
                      accessibilityRole="imagebutton"
                      accessibilityLabel={`인증 사진 ${index + 1} 확대`}
                      onPress={() => setExpandedImagePath(imagePath)}
                      style={styles.imageButton}
                      testID={`routine-proof-image-${index}`}
                    >
                      <DetailImage
                        imagePath={imagePath}
                        style={styles.thumbnailImage}
                      />
                    </Pressable>
                  ) : (
                    <View
                      key={`empty-image-slot-${index}`}
                      pointerEvents="none"
                      style={[styles.imageButton, styles.emptyImageSlot]}
                    />
                  );
                },
              )}
            </View>
          </ThemeView>
        ) : null}

        {detail?.createdAt ? (
          <ThemeView
            transparent
            style={[
              styles.section,
              imagePaths.length ? styles.proofSectionSpacing : null,
            ]}
          >
            <Typography
              variant="caption1"
              weight="semibold"
              style={styles.sectionTitle}
            >
              인증 시간
            </Typography>
            <Typography variant="body2" style={styles.detailText}>
              {getFormatDateTime(detail.createdAt)}
            </Typography>
          </ThemeView>
        ) : null}

        {messages.length ? (
          <ThemeView
            transparent
            style={[styles.section, styles.proofSectionSpacing]}
          >
            <Typography
              variant="caption1"
              weight="semibold"
              style={styles.sectionTitle}
            >
              주고받은 메시지
            </Typography>
            <ThemeView transparent style={styles.chatList}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.chatRow,
                    message.mine ? styles.chatRowMine : null,
                  ]}
                  testID={`routine-proof-chat-${message.id}`}
                >
                  {!message.mine ? (
                    <DetailAvatar
                      imageSource={message.avatarSource}
                      nickname={message.nickname}
                      showNickname
                    />
                  ) : null}
                  <View
                    style={[
                      styles.chatBubble,
                      message.mine ? styles.chatBubbleMine : null,
                    ]}
                  >
                    <Typography variant="body2" style={styles.chatText}>
                      {message.text}
                    </Typography>
                  </View>
                  {message.time ? (
                    <Typography variant="caption2" style={styles.chatTime}>
                      {message.time}
                    </Typography>
                  ) : null}
                  {message.mine ? <DetailAvatar nickname="나" /> : null}
                </View>
              ))}
            </ThemeView>
          </ThemeView>
        ) : null}
      </ScrollView>
      <FullscreenModal
        animationType="fade"
        transparent
        visible={Boolean(expandedImagePath)}
        onRequestClose={() => setExpandedImagePath(null)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="인증 사진 닫기"
          onPress={() => setExpandedImagePath(null)}
          style={styles.expandedImageBackdrop}
          testID="routine-proof-image-backdrop"
        >
          {expandedImagePath ? (
            <Image
              source={{ uri: expandedImagePath }}
              style={styles.expandedImage}
              resizeMode="contain"
              testID="routine-proof-expanded-image"
            />
          ) : null}
        </Pressable>
      </FullscreenModal>
    </ThemeView>
  );
};

export default RoutineProofDetailModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: baseFoundation.spacing[6],
  },
  scroll: {
    gap: baseFoundation.spacing[5],
    paddingTop: baseFoundation.spacing[3],
    paddingBottom: baseFoundation.spacing[8],
  },
  header: { gap: baseFoundation.spacing[2] },
  title: { color: theme.colors.brand.text },
  description: { color: theme.colors.text.muted },
  section: { gap: baseFoundation.spacing[2] },
  proofSectionSpacing: { marginTop: 20 },
  sectionTitle: { color: theme.colors.text.muted },
  detailText: { color: theme.colors.brand.text },
  imageRow: { flexDirection: 'row', gap: baseFoundation.spacing[2] },
  imageButton: {
    flex: 1,
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: baseFoundation.radii.s,
    backgroundColor: theme.colors.brand.card,
  },
  emptyImageSlot: { opacity: 0 },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: baseFoundation.radii.s,
  },
  chatList: { gap: baseFoundation.spacing[3] },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: baseFoundation.spacing[2],
  },
  chatRowMine: { justifyContent: 'flex-end' },
  chatAvatar: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.dimension.x18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.card,
  },
  chatAvatarGroup: {
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
  },
  chatAvatarText: { color: theme.colors.text.secondary },
  chatAvatarNickname: {
    maxWidth: baseFoundation.dimension.x52,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  chatAvatarImage: {
    width: '104%',
    height: '104%',
    transform: [{ translateY: -4 }],
  },
  chatBubble: {
    maxWidth: '68%',
    paddingHorizontal: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[2],
    borderRadius: baseFoundation.radii.m,
    backgroundColor: theme.colors.brand.card,
  },
  chatBubbleMine: { backgroundColor: theme.colors.brand.primary },
  chatText: { color: theme.colors.brand.text },
  chatTime: { color: theme.colors.text.tertiary },
  expandedImageBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseFoundation.spacing[6],
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  expandedImage: { width: '100%', height: '100%' },
}));
