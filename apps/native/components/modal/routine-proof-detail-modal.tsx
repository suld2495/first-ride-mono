import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import type { RoutineDetail } from '@repo/types';
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
import EmptyState from '@/components/ui/empty-state';
import FullscreenModal from '@/components/ui/fullscreen-modal';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useRequestId } from '@/hooks/useRequestSelection';
import { useRoutineForm } from '@/hooks/useRoutineSelection';
import { routineProofDetailColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';
import { getApiErrorMessage } from '@/utils/error-utils';

const DETAIL_IMAGE_THUMBNAIL_COUNT = 3;
const DETAIL_IMAGE_WIDE_SLOT_COUNT = 2;
// 피그마 헤더는 44pt 높이에 제목이 중앙(22pt)에 있고, 공용 PageHeader는 38pt 높이(제목 중심 19pt) + 아래 여백 6pt다.
// 헤더 제목 ↔ 루틴 제목 간격(38pt)을 피그마와 동일하게 맞추기 위해 상단 여백에서 3pt를 뺀다.
const HEADER_TITLE_CENTER_OFFSET = baseFoundation.dimension.x3;
const MESSAGE_PLACEHOLDER = '안녕하세요?';
const REPLY_MESSAGE_BLUR_OVERLAY = require('../../assets/routine-message-blur-overlay-reply.png');
const REQUEST_MESSAGE_BLUR_OVERLAY = require('../../assets/routine-message-blur-overlay.png');

const getMessageTime = (dateInput?: null | string) => {
  if (!dateInput) return '';

  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) return '';

  const hour = date.getHours() % 12 || 12;
  const period = date.getHours() < 12 ? '오전' : '오후';
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${period} ${hour}:${minute}`;
};

const getProofCompletedLabel = (dateInput: string) => {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) return '';

  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${getMessageTime(dateInput)} 인증 완료`;
};

type DetailImageProps = {
  imagePath: string;
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

const DetailImage = ({ imagePath, style }: DetailImageProps) => {
  if (imagePath.endsWith('svg')) {
    return <Svg.SvgUri uri={imagePath} style={style} />;
  }

  return (
    <Image source={{ uri: imagePath }} style={style} resizeMode="contain" />
  );
};

const BlurredMessageText = ({ source }: { source: ImageSourcePropType }) => (
  <View style={styles.chatBlurContainer} testID="routine-proof-chat-text">
    <Image
      source={source}
      resizeMode="stretch"
      style={styles.chatTextBlur}
      testID="routine-proof-chat-blur-image"
      accessible={false}
    />
  </View>
);

type RoutineProofDetailModalProps = {
  previewCurrentNickname?: string;
  previewDetail?: RoutineDetail;
};

type RoutineProofMessage = {
  avatarSource: ImageSourcePropType | undefined;
  blurOverlaySource: ImageSourcePropType;
  id: string;
  isBlurred: boolean;
  mine: boolean;
  nickname: string;
  text: string;
  time: string;
};

const RoutineProofDetailModal = ({
  previewCurrentNickname,
  previewDetail,
}: RoutineProofDetailModalProps = {}) => {
  const confirmId = useRequestId();
  const {
    data: fetchedDetail,
    error,
    isError,
    isLoading,
  } = useFetchRequestDetailQuery(confirmId);
  const user = useAuthUser();
  const selectedRoutine = useRoutineForm();
  const detail = previewDetail ?? fetchedDetail;
  const imagePaths = useMemo(() => {
    if (detail?.imagePaths?.length) {
      return detail.imagePaths.slice(0, DETAIL_IMAGE_THUMBNAIL_COUNT);
    }

    return detail?.imagePath ? [detail.imagePath] : [];
  }, [detail?.imagePath, detail?.imagePaths]);
  const [expandedImagePath, setExpandedImagePath] = useState<null | string>(
    null,
  );
  const isCompactImageRow = imagePaths.length >= DETAIL_IMAGE_THUMBNAIL_COUNT;
  const imageSlotCount = isCompactImageRow
    ? DETAIL_IMAGE_THUMBNAIL_COUNT
    : DETAIL_IMAGE_WIDE_SLOT_COUNT;

  if (isLoading && !previewDetail) return null;

  if (isError && !previewDetail) {
    return (
      <ThemeView style={styles.container} testID="routine-proof-detail-error">
        <EmptyState
          icon="alert-circle-outline"
          message={getApiErrorMessage(
            error,
            '인증 상세를 불러오지 못했습니다.',
          )}
          transparent
        />
      </ThemeView>
    );
  }

  const routineDescription = detail?.routineDetail?.trim();
  const fallbackRoutineDescription = selectedRoutine.routineDetail?.trim();
  const visibleRoutineDescription =
    routineDescription ?? fallbackRoutineDescription;
  const routineName = detail?.routineName ?? selectedRoutine.routineName;
  const memo = detail?.memo?.trim();
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
    detail?.hasRequestMessage === true
      ? {
          id: 'request-message',
          blurOverlaySource: REQUEST_MESSAGE_BLUR_OVERLAY,
          avatarSource:
            isRequesterMe && user?.characterImageUrl
              ? getRoutineSceneRemoteAsset(user.characterImageUrl)?.source
              : requesterAvatarSource,
          isBlurred: !requestMessage,
          text: requestMessage || MESSAGE_PLACEHOLDER,
          time: getMessageTime(detail?.createdAt),
          mine: isRequesterMe,
          nickname: detail?.requesterNickname ?? '',
        }
      : null,
    detail?.hasResponseComment === true
      ? {
          id: 'reply-message',
          blurOverlaySource: REPLY_MESSAGE_BLUR_OVERLAY,
          avatarSource:
            !isRequesterMe && user?.characterImageUrl
              ? getRoutineSceneRemoteAsset(user.characterImageUrl)?.source
              : responderAvatarSource,
          isBlurred: !replyMessage,
          text: replyMessage || MESSAGE_PLACEHOLDER,
          time: getMessageTime(detail?.checkedAt),
          mine: !isRequesterMe,
          nickname: detail?.responderNickname ?? '',
        }
      : null,
  ]
    .filter((message): message is RoutineProofMessage => message !== null)
    .sort((left, right) => Number(right.mine) - Number(left.mine));

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

        <View style={styles.sections}>
          {imagePaths.length || detail?.createdAt ? (
            <View style={styles.proofSection}>
              {imagePaths.length ? (
                <View style={styles.imageRow}>
                  {Array.from({ length: imageSlotCount }).map((_, index) => {
                    const imagePath = imagePaths[index];
                    const imageSizeStyle = isCompactImageRow
                      ? styles.imageButtonCompact
                      : styles.imageButtonWide;

                    return imagePath ? (
                      <Pressable
                        key={`${imagePath}-${index}`}
                        accessibilityRole="imagebutton"
                        accessibilityLabel={`인증 사진 ${index + 1} 확대`}
                        onPress={() => setExpandedImagePath(imagePath)}
                        style={[styles.imageButton, imageSizeStyle]}
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
                        style={[
                          styles.imageButton,
                          imageSizeStyle,
                          styles.emptyImageSlot,
                        ]}
                      />
                    );
                  })}
                </View>
              ) : null}
              {detail?.createdAt ? (
                <Typography
                  variant="caption1"
                  style={styles.proofCaption}
                  testID="routine-proof-completed-at"
                >
                  {getProofCompletedLabel(detail.createdAt)}
                </Typography>
              ) : null}
            </View>
          ) : null}

          {memo ? (
            <ThemeView
              transparent
              style={styles.section}
              testID="routine-proof-memo-section"
            >
              <Typography
                variant="caption1"
                weight="bold"
                style={styles.sectionTitle}
              >
                메모
              </Typography>
              <View style={styles.detailBox}>
                <Typography variant="body1" style={styles.detailText}>
                  {memo}
                </Typography>
              </View>
            </ThemeView>
          ) : null}

          {messages.length ? (
            <ThemeView transparent style={styles.section}>
              <Typography
                variant="caption1"
                weight="bold"
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
                        styles.chatContent,
                        message.mine ? styles.chatContentMine : null,
                      ]}
                    >
                      {!message.mine ? (
                        <Typography
                          variant="caption1"
                          style={styles.chatAvatarNickname}
                          testID={`routine-proof-chat-nickname-${message.nickname}`}
                        >
                          {message.nickname}
                        </Typography>
                      ) : null}
                      <View
                        style={[
                          styles.chatMessageRow,
                          message.mine ? styles.chatMessageRowMine : null,
                        ]}
                      >
                        {message.mine && message.time ? (
                          <Typography
                            variant="caption3"
                            style={styles.chatTime}
                          >
                            {message.time}
                          </Typography>
                        ) : null}
                        <View
                          style={[
                            styles.chatBubble,
                            message.mine ? styles.chatBubbleMine : null,
                          ]}
                        >
                          {message.isBlurred ? (
                            <BlurredMessageText
                              source={message.blurOverlaySource}
                            />
                          ) : (
                            <View
                              style={styles.chatTextContainer}
                              testID="routine-proof-chat-text"
                            >
                              <Typography
                                variant="body3"
                                style={
                                  message.mine
                                    ? styles.chatTextMine
                                    : styles.chatText
                                }
                              >
                                {message.text}
                              </Typography>
                            </View>
                          )}
                        </View>
                        {!message.mine && message.time ? (
                          <Typography
                            variant="caption3"
                            style={styles.chatTime}
                          >
                            {message.time}
                          </Typography>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}
              </ThemeView>
            </ThemeView>
          ) : null}
        </View>
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

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    paddingHorizontal: baseFoundation.spacing[6],
    backgroundColor: routineProofDetailColors.background,
  },
  scroll: {
    gap: baseFoundation.spacing[5],
    paddingTop: baseFoundation.spacing[4] - HEADER_TITLE_CENTER_OFFSET,
    paddingBottom: baseFoundation.spacing[8],
  },
  sections: { gap: baseFoundation.spacing[10] },
  header: { gap: baseFoundation.spacing[2] },
  title: {
    color: routineProofDetailColors.text,
    lineHeight: 27.2,
    letterSpacing: -0.4,
  },
  description: {
    color: routineProofDetailColors.description,
    lineHeight: 20.4,
    letterSpacing: -0.3,
  },
  section: { gap: baseFoundation.spacing[1] },
  proofSection: { gap: baseFoundation.spacing[1.5] },
  proofCaption: {
    color: routineProofDetailColors.label,
    lineHeight: 17.68,
    letterSpacing: -0.13,
  },
  sectionTitle: {
    color: routineProofDetailColors.label,
    lineHeight: 17.68,
    letterSpacing: -0.13,
  },
  detailBox: {
    paddingHorizontal: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[2],
    borderRadius: baseFoundation.radii.xs,
    backgroundColor: routineProofDetailColors.surface,
  },
  detailText: {
    color: routineProofDetailColors.text,
    lineHeight: 21.76,
    letterSpacing: -0.32,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseFoundation.spacing[3],
  },
  imageButton: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: routineProofDetailColors.border,
    borderRadius: baseFoundation.radii.s,
    backgroundColor: routineProofDetailColors.surface,
  },
  imageButtonWide: {
    height: baseFoundation.dimension.x140 - baseFoundation.dimension.x4,
  },
  imageButtonCompact: { aspectRatio: 1 },
  emptyImageSlot: { opacity: 0 },
  thumbnailImage: { width: '100%', height: '100%' },
  chatList: {
    gap: baseFoundation.spacing[7],
    paddingHorizontal: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[5],
    borderRadius: baseFoundation.radii.m,
    backgroundColor: routineProofDetailColors.surface,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseFoundation.dimension.x6,
  },
  chatRowMine: { justifyContent: 'flex-end' },
  chatContent: { flex: 1, minWidth: 0, gap: baseFoundation.dimension.x2 },
  chatContentMine: { alignItems: 'flex-end' },
  chatMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: baseFoundation.spacing[1],
  },
  chatMessageRowMine: { justifyContent: 'flex-end' },
  chatAvatar: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    borderRadius: baseFoundation.radii.round,
    borderWidth: 1,
    borderColor: routineProofDetailColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chatAvatarText: { color: routineProofDetailColors.nickname },
  chatAvatarNickname: {
    color: routineProofDetailColors.nickname,
    lineHeight: 17.68,
    letterSpacing: -0.13,
  },
  // 캐릭터 스프라이트의 시각적 무게가 아래쪽에 있어 4pt 올려 원 안에서 중앙에 보이도록 한다.
  chatAvatarImage: {
    width: '100%',
    height: '100%',
    transform: [{ translateY: -baseFoundation.dimension.x4 }],
  },
  chatBubble: {
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    paddingHorizontal: baseFoundation.spacing[2],
    paddingVertical: baseFoundation.spacing[1.5],
    borderRadius: baseFoundation.radii.xs,
    backgroundColor: routineProofDetailColors.replyBackground,
  },
  chatBubbleMine: { backgroundColor: routineProofDetailColors.border },
  chatTextContainer: { flexShrink: 1 },
  chatBlurContainer: {
    width: baseFoundation.dimension.x96,
    height: baseFoundation.dimension.x28,
  },
  chatTextBlur: { width: '100%', height: '100%' },
  chatText: {
    color: routineProofDetailColors.message,
    lineHeight: 18.2,
    letterSpacing: -0.28,
  },
  chatTextMine: {
    color: routineProofDetailColors.ownMessage,
    lineHeight: 18.2,
    letterSpacing: -0.28,
  },
  chatTime: {
    flexShrink: 0,
    color: routineProofDetailColors.label,
    lineHeight: 14.96,
    letterSpacing: -0.11,
  },
  expandedImageBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: baseFoundation.spacing[6],
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  expandedImage: { width: '100%', height: '100%' },
}));
