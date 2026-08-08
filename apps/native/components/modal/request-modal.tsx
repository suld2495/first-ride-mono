import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { createRequestFormValidators } from '@repo/shared/service/validatorMessage';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView } from 'react-native';

import RequetButtonGroup from '@/components/request/request-button-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useCreateForm } from '@/hooks/useForm';
import { usePendingRoutineShareImages } from '@/hooks/usePendingRoutineShareImages';
import {
  MAX_REQUEST_IMAGE_COUNT,
  type RequestForm,
  type RequestImage,
  useRequestSubmission,
} from '@/hooks/useRequestSubmission';
import { useRoutineId } from '@/hooks/useRoutineSelection';
import { baseFoundation, palette } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<RequestForm>();
const requestImageSlots = Array.from(
  { length: MAX_REQUEST_IMAGE_COUNT },
  (_, index) => index,
);
const REQUEST_IMAGE_ACTION_HEIGHT = baseFoundation.dimension.x60;

const RequestModal = () => {
  const { theme } = useAppTheme();
  const { shareSessionId } = useLocalSearchParams<{
    shareSessionId?: string;
  }>();
  const routineId = useRoutineId();
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);
  const sharedImages = usePendingRoutineShareImages(routineId, shareSessionId);
  const hasMateTarget = detail?.isMe === false && !!detail?.mateNickname;
  const photoRequired = detail?.photoRequired ?? true;
  const requestImageValidators = useMemo(
    () => createRequestFormValidators<RequestImage>(photoRequired),
    [photoRequired],
  );
  const initialForm = useMemo<RequestForm>(
    () => ({ images: sharedImages, message: '' }),
    [sharedImages],
  );
  const { handleSubmit, pickImage, takePicture, isPending, uploadProgress } =
    useRequestSubmission(
      routineId,
      detail
        ? {
            nickname: detail.nickname,
            isMe: detail.isMe,
            paused: detail.paused,
            photoRequired: detail.photoRequired,
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
            style={[
              styles.routineSummary,
              !hasMateTarget && styles.routineSummaryFull,
            ]}
            transparent
          >
            <ThemeView style={styles.infoGroup} transparent>
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
            </ThemeView>
            <ThemeView style={styles.infoGroup} transparent>
              <Typography variant="body2" style={styles.infoLabel}>
                루틴 설명
              </Typography>
              <Typography
                variant="body1"
                weight="semibold"
                style={styles.infoValue}
              >
                {detail?.routineDetail}
              </Typography>
            </ThemeView>
          </ThemeView>
          {hasMateTarget && (
            <>
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
                  {detail.mateNickname}
                </Typography>
              </ThemeView>
            </>
          )}
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
                    인증 사진
                  </Typography>
                  {!photoRequired && (
                    <Typography
                      testID="request-photo-optional-label"
                      variant="caption2"
                      style={styles.photoOptionalLabel}
                    >
                      선택
                    </Typography>
                  )}
                </ThemeView>

                <ThemeView style={styles.uploadFrame} transparent>
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
                            source={{ uri: image.uri }}
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

          {isPending && (
            <ThemeView
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: uploadProgress,
              }}
              testID="request-upload-progress-track"
              style={styles.uploadProgressTrack}
            >
              <ThemeView
                testID="request-upload-progress-fill"
                style={[
                  styles.uploadProgressFill,
                  { width: `${uploadProgress}%` },
                ]}
              />
            </ThemeView>
          )}

          <ThemeView
            testID="request-message-section"
            style={styles.messageSection}
            transparent
          >
            <FormItem
              name="message"
              label="메시지"
              optionalLabel="(선택)"
              item={({ value, onChange }) => (
                <Input
                  accessibilityLabel="메시지"
                  editable={!isPending}
                  fullWidth
                  inputStyle={styles.messageInput}
                  maxLength={100}
                  multiline
                  onChangeText={onChange}
                  placeholder="메이트에게 남길 한 줄 메시지"
                  style={styles.messageField}
                  value={value}
                  variant="filled"
                />
              )}
            />
          </ThemeView>

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
    gap: baseFoundation.spacing[3],
  },

  routineSummaryFull: {
    width: '100%',
  },

  targetSummary: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: baseFoundation.spacing[6],
  },

  infoGroup: {
    gap: baseFoundation.spacing[1.5],
  },

  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    height: baseFoundation.dimension.x36,
    backgroundColor: theme.colors.brand.primary,
  },

  infoLabel: {
    color: theme.colors.text.muted,
  },

  infoValue: {
    color: theme.colors.brand.text,
  },

  mediaStage: {
    overflow: 'hidden',
    borderRadius: baseFoundation.radii.s,
    borderWidth: 0,
    backgroundColor: theme.colors.background.media,
  },

  uploadProgressTrack: {
    width: '100%',
    height: baseFoundation.dimension.x6,
    marginTop: baseFoundation.spacing[2],
    overflow: 'hidden',
    borderRadius: baseFoundation.radii.round,
    backgroundColor: theme.colors.brand.bottomTab,
  },

  uploadProgressFill: {
    height: '100%',
    borderRadius: baseFoundation.radii.round,
    backgroundColor: theme.colors.action.primary.default,
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

  photoOptionalLabel: {
    color: theme.colors.text.muted,
  },

  imageCount: {
    color: theme.colors.action.primary.default,
  },

  messageField: {
    minHeight: baseFoundation.dimension.x112,
    height: 'auto',
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[3],
    borderRadius: baseFoundation.radii.s,
    backgroundColor: theme.colors.background.media,
  },

  messageInput: {
    minHeight: baseFoundation.dimension.x80,
    textAlignVertical: 'top',
  },

  messageSection: {
    marginTop: baseFoundation.spacing[4],
  },

  uploadFrame: {
    marginHorizontal: baseFoundation.spacing[4],
    marginTop: baseFoundation.spacing[2],
    marginBottom: baseFoundation.spacing[4],
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
