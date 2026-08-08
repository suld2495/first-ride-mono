import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import type { RoutineDetail } from '@repo/types';
import { getFormatDateTime } from '@repo/shared/utils';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  View,
} from 'react-native';
import * as Svg from 'react-native-svg';

import { getRoutineSceneRemoteAsset } from '@/components/routine/routine-scene-art';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useRequestId } from '@/hooks/useRequestSelection';
import { baseFoundation } from '@/theme/tokens';

const REQUEST_IMAGE_RATIO_FALLBACK = 1;
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
  imageRatio?: number;
  style: StyleProp<ImageStyle>;
};

type DetailAvatarProps = {
  imageSource?: ImageSourcePropType;
  nickname: string;
};

const DetailAvatar = ({ imageSource, nickname }: DetailAvatarProps) => (
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
        {nickname.slice(0, 1)}
      </Typography>
    )}
  </View>
);

const DetailImage = ({ imagePath, imageRatio, style }: DetailImageProps) => {
  const imageStyle = [
    style,
    { aspectRatio: imageRatio ?? REQUEST_IMAGE_RATIO_FALLBACK },
  ];

  if (imagePath.endsWith('svg')) {
    return <Svg.SvgUri uri={imagePath} style={imageStyle} />;
  }

  return <Image source={{ uri: imagePath }} style={imageStyle} />;
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
  const detail = previewDetail ?? fetchedDetail;
  const imagePaths = useMemo(
    () => detail?.imagePaths?.slice(0, DETAIL_IMAGE_THUMBNAIL_COUNT) ?? [],
    [detail?.imagePaths],
  );
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [expandedImagePath, setExpandedImagePath] = useState<null | string>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    if (!imagePaths.length) {
      setRatios({});
      return () => {
        isActive = false;
      };
    }

    if (Platform.OS === 'web') {
      setRatios(
        Object.fromEntries(
          imagePaths.map((imagePath) => [
            imagePath,
            REQUEST_IMAGE_RATIO_FALLBACK,
          ]),
        ),
      );
      return () => {
        isActive = false;
      };
    }

    void Promise.all(
      imagePaths.map(async (imagePath) => {
        try {
          const { width, height } = await Image.getSize(imagePath);

          return [
            imagePath,
            height > 0 ? width / height : REQUEST_IMAGE_RATIO_FALLBACK,
          ] as const;
        } catch {
          return [imagePath, REQUEST_IMAGE_RATIO_FALLBACK] as const;
        }
      }),
    ).then((entries) => {
      if (isActive) setRatios(Object.fromEntries(entries));
    });

    return () => {
      isActive = false;
    };
  }, [imagePaths]);

  if (isLoading && !previewDetail) return null;

  const routineDescription = detail?.routineDetail?.trim();
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
          nickname: detail?.nickname ?? '',
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
          <Typography variant="h2" weight="bold" style={styles.title}>
            {detail?.routineName}
          </Typography>
          {routineDescription ? (
            <Typography variant="body2" style={styles.description}>
              {routineDescription}
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
              이번 주 인증 사진
            </Typography>
            <View style={styles.imageRow}>
              {imagePaths.map((imagePath, index) => (
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
                    imageRatio={ratios[imagePath]}
                    style={styles.thumbnailImage}
                  />
                </Pressable>
              ))}
            </View>
          </ThemeView>
        ) : null}

        <ThemeView transparent style={styles.section}>
          <Typography
            variant="caption1"
            weight="semibold"
            style={styles.sectionTitle}
          >
            인증 시간
          </Typography>
          <Typography variant="body2" style={styles.detailText}>
            {detail?.createdAt ? getFormatDateTime(detail.createdAt) : ''}
          </Typography>
        </ThemeView>

        {messages.length ? (
          <ThemeView transparent style={styles.section}>
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
                  {message.mine ? (
                    <DetailAvatar
                      imageSource={message.avatarSource}
                      nickname={message.nickname}
                    />
                  ) : null}
                </View>
              ))}
            </ThemeView>
          </ThemeView>
        ) : null}
      </ScrollView>
      <Modal
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
      </Modal>
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
  description: { color: theme.colors.text.secondary },
  section: { gap: baseFoundation.spacing[2] },
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
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    borderRadius: baseFoundation.dimension.x14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.card,
  },
  chatAvatarText: { color: theme.colors.text.secondary },
  chatAvatarImage: { width: '115%', height: '115%' },
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
