import Ionicons from '@expo/vector-icons/Ionicons';
import type { Validators } from '@repo/shared/components';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { requestFormValidators } from '@repo/shared/service/validatorMessage';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView } from 'react-native';

import RequetButtonGroup from '@/components/request/request-button-group';
import { Button } from '@/components/ui/button';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useCreateForm } from '@/hooks/useForm';
import { usePendingRoutineShareImages } from '@/hooks/usePendingRoutineShareImages';
import {
  MAX_REQUEST_IMAGE_COUNT,
  type RequestImage,
  useRequestSubmission,
} from '@/hooks/useRequestSubmission';
import { useRoutineId } from '@/hooks/useRoutineSelection';
import { baseFoundation, palette } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ images: RequestImage[] }>();
const requestImageValidators = requestFormValidators as unknown as Validators<{
  images: RequestImage[];
}>;
const requestImageSlots = Array.from(
  { length: MAX_REQUEST_IMAGE_COUNT },
  (_, index) => index,
);
const REQUEST_EMPTY_PROMPT_AREA_MIN_HEIGHT = baseFoundation.dimension.x120;
const REQUEST_EMPTY_PROMPT_WIDTH =
  baseFoundation.dimension.x140 + baseFoundation.dimension.x12;
const REQUEST_EMPTY_PROMPT_MIN_HEIGHT =
  baseFoundation.dimension.x80 + baseFoundation.dimension.x8;
const REQUEST_IMAGE_ACTION_HEIGHT = baseFoundation.dimension.x60;

const RequestModal = () => {
  const { theme } = useAppTheme();
  const { shareSessionId } = useLocalSearchParams<{
    shareSessionId?: string;
  }>();
  const routineId = useRoutineId();
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);
  const sharedImages = usePendingRoutineShareImages(routineId, shareSessionId);
  const initialForm = useMemo<{ images: RequestImage[] }>(
    () => ({ images: sharedImages }),
    [sharedImages],
  );
  const { handleSubmit, pickImage, takePicture, isPending } =
    useRequestSubmission(
      routineId,
      detail
        ? {
            nickname: detail.nickname,
            isMe: detail.isMe,
            paused: detail.paused,
          }
        : undefined,
    );

  if (isLoading) {
    return null;
  }

  return (
    <ThemeView testID="request-form-content" style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
      >
        <ThemeView testID="request-summary" style={styles.summary} transparent>
          <ThemeView
            testID="request-routine-summary"
            style={styles.routineSummary}
            transparent
          >
            <Typography variant="body2" style={styles.infoLabel}>
              루틴 이름
            </Typography>
            <Typography
              variant="body1"
              weight="semibold"
              style={styles.infoValue}
            >
              {detail?.routineName}
            </Typography>
            <Typography variant="body2" style={styles.infoDescription}>
              {detail?.routineDetail}
            </Typography>
          </ThemeView>
          <ThemeView
            testID="request-summary-divider"
            style={styles.summaryDivider}
            transparent
          />
          <ThemeView
            testID="request-target-summary"
            style={styles.targetSummary}
            transparent
          >
            <Typography variant="body2" style={styles.infoLabel}>
              인증 대상
            </Typography>
            <Typography
              variant="body1"
              weight="semibold"
              style={styles.infoValue}
            >
              {detail?.isMe ? '나' : detail?.mateNickname}
            </Typography>
          </ThemeView>
        </ThemeView>

        <Form
          form={initialForm}
          onSubmit={handleSubmit}
          validators={requestImageValidators}
        >
          <FormItem
            name="images"
            item={({ form, setValue }) => (
              <ThemeView
                testID="request-media-stage"
                style={styles.mediaStage}
                transparent
              >
                <ThemeView style={styles.mediaHeader} transparent>
                  <Typography
                    variant="body3"
                    weight="bold"
                    style={styles.mediaTitle}
                  >
                    이미지 업로드
                  </Typography>
                  <Typography
                    variant="body3"
                    weight="semibold"
                    style={styles.imageCount}
                  >
                    {form.images.length}/{MAX_REQUEST_IMAGE_COUNT}
                  </Typography>
                </ThemeView>

                <ThemeView style={styles.uploadFrame} transparent>
                  {form.images.length < MAX_REQUEST_IMAGE_COUNT && (
                    <ThemeView
                      testID="request-empty-image-area"
                      style={styles.emptyPromptArea}
                      transparent
                    >
                      <Pressable
                        testID="request-empty-image-button"
                        accessibilityLabel="사진 추가"
                        accessibilityHint="앨범에서 사진을 선택합니다"
                        accessibilityRole="button"
                        disabled={isPending}
                        style={styles.emptyPrompt}
                        onPress={() => pickImage(setValue, form.images)}
                      >
                        <Ionicons
                          testID="request-empty-image-icon"
                          name="image-outline"
                          size={baseFoundation.dimension.x44}
                          color={palette.theme.softBlue[20]}
                          style={styles.emptyPromptIcon}
                        />
                        <Typography
                          variant="body3"
                          style={styles.emptyPromptText}
                        >
                          사진을 추가해 주세요
                        </Typography>
                      </Pressable>
                    </ThemeView>
                  )}

                  <ThemeView style={styles.previewList} transparent>
                    {requestImageSlots.map((index) => {
                      const image = form.images[index];

                      if (!image) {
                        return (
                          <ThemeView
                            key={`request-image-slot-${index}`}
                            testID="request-image-slot"
                            style={styles.previewItem}
                            transparent
                          >
                            <Pressable
                              accessibilityLabel={`사진 ${index + 1} 추가`}
                              accessibilityHint="앨범에서 사진을 선택합니다"
                              accessibilityRole="button"
                              disabled={
                                isPending ||
                                form.images.length >= MAX_REQUEST_IMAGE_COUNT
                              }
                              style={styles.slotButton}
                              onPress={() => pickImage(setValue, form.images)}
                            >
                              <Ionicons
                                testID="request-image-slot-icon"
                                name="add-circle-outline"
                                size={baseFoundation.dimension.x28}
                                color={palette.theme.gray[300]}
                              />
                            </Pressable>
                          </ThemeView>
                        );
                      }

                      const handleRemoveImage = () => {
                        setValue(
                          'images',
                          form.images.filter((_, imageIndex) => {
                            return imageIndex !== index;
                          }),
                        );
                      };

                      return (
                        <ThemeView
                          key={`request-image-slot-${index}`}
                          testID="request-image-slot"
                          style={styles.previewItem}
                          transparent
                        >
                          <Image
                            testID="request-image-preview"
                            source={{ uri: image.previewUri }}
                            style={styles.preview}
                            resizeMode="cover"
                          />
                          <Pressable
                            accessibilityLabel="이미지 제거"
                            accessibilityRole="button"
                            disabled={isPending}
                            hitSlop={baseFoundation.spacing[2]}
                            onPress={handleRemoveImage}
                            style={[
                              styles.removeButton,
                              isPending && styles.removeButtonDisabled,
                            ]}
                            testID={`remove-request-image-${index}`}
                          >
                            <Ionicons
                              name="close"
                              size={baseFoundation.iconSize.s}
                              color="#FFFFFF"
                            />
                          </Pressable>
                        </ThemeView>
                      );
                    })}
                  </ThemeView>
                </ThemeView>

                <ThemeView
                  testID="request-image-actions"
                  style={styles.imageActions}
                  transparent
                >
                  <Button
                    testID="gallery-button"
                    title="앨범에서 선택"
                    variant="ghost"
                    textColor={theme.colors.action.primary.default}
                    leftIcon={({ color }) => (
                      <Ionicons
                        name="image-outline"
                        size={baseFoundation.iconSize.l}
                        color={color}
                      />
                    )}
                    size="sm"
                    style={styles.imageAction}
                    textStyle={styles.imageActionText}
                    disabled={
                      isPending || form.images.length >= MAX_REQUEST_IMAGE_COUNT
                    }
                    onPress={() => pickImage(setValue, form.images)}
                  />
                  <ThemeView style={styles.actionDivider} transparent />
                  <Button
                    testID="camera-button"
                    title="카메라로 촬영"
                    variant="ghost"
                    textColor={theme.colors.action.primary.default}
                    leftIcon={({ color }) => (
                      <Ionicons
                        name="camera-outline"
                        size={baseFoundation.iconSize.l}
                        color={color}
                      />
                    )}
                    size="sm"
                    style={styles.imageAction}
                    textStyle={styles.imageActionText}
                    disabled={
                      isPending || form.images.length >= MAX_REQUEST_IMAGE_COUNT
                    }
                    onPress={() => takePicture(setValue, form.images)}
                  />
                </ThemeView>
              </ThemeView>
            )}
          />

          <RequetButtonGroup useForm={useForm} loading={isPending} />
        </Form>
      </ScrollView>
    </ThemeView>
  );
};

export default RequestModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    marginTop: baseFoundation.spacing[3],
    paddingHorizontal: baseFoundation.dimension.x18,
  },

  scroll: {
    gap: baseFoundation.spacing[5],
    paddingBottom: baseFoundation.spacing[6],
  },

  summary: {
    minHeight: baseFoundation.dimension.x96,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: baseFoundation.spacing[4],
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: theme.colors.brand.primary,
  },

  routineSummary: {
    width: '50%',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
  },

  targetSummary: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: baseFoundation.spacing[5],
  },

  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: baseFoundation.dimension.x36,
    backgroundColor: theme.colors.brand.primary,
  },

  infoLabel: {
    color: theme.colors.text.muted,
    marginBottom: baseFoundation.spacing[1.5],
  },

  infoValue: {
    color: theme.colors.brand.text,
  },

  infoDescription: {
    color: theme.colors.text.muted,
    marginTop: baseFoundation.spacing[1.5],
  },

  mediaStage: {
    overflow: 'hidden',
    borderRadius: baseFoundation.radii.s,
    borderWidth: 0,
    backgroundColor: theme.colors.background.media,
  },

  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: baseFoundation.spacing[4],
    paddingTop: baseFoundation.spacing[4],
  },

  mediaTitle: {
    color: theme.colors.brand.text,
  },

  imageCount: {
    color: theme.colors.action.primary.default,
  },

  uploadFrame: {
    margin: baseFoundation.spacing[4],
    padding: baseFoundation.spacing[2.5],
    gap: baseFoundation.spacing[3],
    borderWidth: baseFoundation.dimension.x1,
    borderStyle: 'dashed',
    borderColor: palette.theme.gray[300],
    borderRadius: baseFoundation.radii.s,
  },

  emptyPromptArea: {
    minHeight: REQUEST_EMPTY_PROMPT_AREA_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyPrompt: {
    width: REQUEST_EMPTY_PROMPT_WIDTH,
    minHeight: REQUEST_EMPTY_PROMPT_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: baseFoundation.spacing[1.5],
    borderRadius: baseFoundation.radii.xs,
  },

  emptyPromptText: {
    color: theme.colors.text.tertiary,
  },

  emptyPromptIcon: {
    transform: [{ translateY: baseFoundation.dimension.x2 }],
  },

  preview: {
    width: baseFoundation.dimension.x96,
    height: baseFoundation.dimension.x80,
    borderRadius: baseFoundation.radii.xs,
  },

  previewItem: {
    position: 'relative',
    width: baseFoundation.dimension.x96,
    height: baseFoundation.dimension.x80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: baseFoundation.dimension.x1,
    borderStyle: 'dashed',
    borderColor: palette.theme.gray[300],
    borderRadius: baseFoundation.radii.xs,
  },

  previewList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: baseFoundation.spacing[2],
  },

  slotButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButton: {
    position: 'absolute',
    right: -baseFoundation.spacing[3],
    top: -baseFoundation.spacing[3],
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    borderRadius: baseFoundation.dimension.x12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },

  removeButtonDisabled: {
    opacity: 0.5,
  },

  imageActions: {
    minHeight: REQUEST_IMAGE_ACTION_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: palette.theme.gray[300],
  },

  imageAction: {
    flex: 1,
    height: REQUEST_IMAGE_ACTION_HEIGHT,
    borderRadius: baseFoundation.radii.none,
    shadowOpacity: 0,
    elevation: 0,
  },

  imageActionText: {
    fontSize: theme.foundation.typography.size.caption1,
  },

  actionDivider: {
    width: baseFoundation.dimension.x1,
    height: baseFoundation.dimension.x28,
    backgroundColor: palette.theme.gray[300],
  },
}));
