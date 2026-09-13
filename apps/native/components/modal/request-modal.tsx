import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { createRequestFormValidators } from '@repo/shared/service/validatorMessage';
import type { Routine } from '@repo/types';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import RequestPlusIcon from '@/components/icons/request-image/request-plus-icon';
import RequestRemoveImageIcon from '@/components/icons/request-image/request-remove-image-icon';
import RequetButtonGroup from '@/components/request/request-button-group';
import RequestImageSourceDialog from '@/components/request/request-image-source-dialog';
import RequestImageSourceTile, {
  type RequestImageSourceKind,
} from '@/components/request/request-image-source-tile';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
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
import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<RequestForm>();

// 피그마: 사진이 2장 미만이면 2열(사진 + 추가 버튼), 2장 이상이면 3열로 배치한다.
const WIDE_IMAGE_SLOT_COUNT = 2;
// 피그마 헤더(44pt, 제목 중심 22pt)와 공용 PageHeader(38pt + 아래 여백 6pt, 제목 중심 19pt) 차이만큼
// 상단 여백에서 3pt를 빼 헤더 제목 ↔ 루틴 제목 간격을 피그마와 맞춘다.
const HEADER_TITLE_CENTER_OFFSET = baseFoundation.dimension.x3;
const getImageSlotCount = (imageCount: number) =>
  imageCount < WIDE_IMAGE_SLOT_COUNT
    ? WIDE_IMAGE_SLOT_COUNT
    : MAX_REQUEST_IMAGE_COUNT;

type RequestModalPreviewDetail = Pick<
  Routine,
  | 'isMe'
  | 'mateNickname'
  | 'nickname'
  | 'paused'
  | 'photoRequired'
  | 'routineDetail'
  | 'routineName'
>;

interface RequestModalProps {
  previewDetail?: RequestModalPreviewDetail;
}

interface SectionLabelProps {
  optional?: boolean;
  optionalTestID?: string;
  required?: boolean;
  requiredTestID?: string;
  title: string;
}

const SectionLabel = ({
  optional = false,
  optionalTestID,
  required = false,
  requiredTestID,
  title,
}: SectionLabelProps) => (
  <View style={styles.labelRow}>
    <Typography variant="caption1" weight="bold" style={styles.label}>
      {title}
    </Typography>
    {required ? (
      <Typography
        variant="caption1"
        weight="bold"
        style={styles.requiredMark}
        testID={requiredTestID}
      >
        *
      </Typography>
    ) : null}
    {optional ? (
      <Typography
        variant="caption3"
        style={styles.optionalLabel}
        testID={optionalTestID}
      >
        선택
      </Typography>
    ) : null}
  </View>
);

const RequestModal = ({ previewDetail }: RequestModalProps = {}) => {
  const { shareSessionId } = useLocalSearchParams<{
    shareSessionId?: string;
  }>();
  const routineId = useRoutineId();
  const { data: fetchedDetail, isLoading } = useRoutineDetailQuery(routineId);
  const detail = previewDetail ?? fetchedDetail;
  const sharedImages = usePendingRoutineShareImages(routineId, shareSessionId);
  const hasMateTarget = detail?.isMe === false && !!detail?.mateNickname;
  const photoRequired = detail?.photoRequired ?? true;
  const routineDescription = detail?.routineDetail?.trim();
  const requestImageValidators = useMemo(
    () => createRequestFormValidators<RequestImage>(photoRequired),
    [photoRequired],
  );
  const initialForm = useMemo<RequestForm>(
    () => ({ images: sharedImages, memo: '', message: '' }),
    [sharedImages],
  );
  const [isSourceDialogVisible, setIsSourceDialogVisible] = useState(false);
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

  if (isLoading && !previewDetail) {
    return null;
  }

  return (
    <ThemeView
      testID="request-form-content"
      style={styles.container}
      transparent
    >
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        contentContainerStyle={styles.scroll}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        testID="request-form-scroll"
      >
        <Form
          form={initialForm}
          onSubmit={handleSubmit}
          validators={requestImageValidators}
        >
          <View style={styles.formBody}>
            <View style={styles.topGroup}>
              <ThemeView
                testID="request-summary"
                style={styles.summary}
                transparent
              >
                <Typography
                  variant="subtitle1"
                  weight="bold"
                  style={styles.title}
                  testID="request-routine-summary"
                >
                  {detail?.routineName}
                </Typography>
                {routineDescription ? (
                  <Typography variant="body2" style={styles.description}>
                    {routineDescription}
                  </Typography>
                ) : null}
                {hasMateTarget && (
                  <View
                    testID="request-target-summary"
                    style={styles.targetRow}
                  >
                    <Typography
                      variant="caption1"
                      weight="bold"
                      style={styles.label}
                    >
                      인증 대상
                    </Typography>
                    <Typography variant="body2" style={styles.targetName}>
                      {detail.mateNickname}
                    </Typography>
                  </View>
                )}
              </ThemeView>

              <FormItem
                name="images"
                item={({ form, setValue }) => {
                  const { images } = form;
                  const canAddImage =
                    !isPending && images.length < MAX_REQUEST_IMAGE_COUNT;
                  const addImage = (source: RequestImageSourceKind) => {
                    if (source === 'gallery') {
                      void pickImage(setValue, images);
                      return;
                    }

                    void takePicture(setValue, images);
                  };
                  const removeImage = (index: number) => {
                    setValue(
                      'images',
                      images.filter((_, imageIndex) => imageIndex !== index),
                    );
                  };

                  return (
                    <ThemeView
                      testID="request-media-stage"
                      style={styles.section}
                      transparent
                    >
                      <SectionLabel
                        title="인증 사진 첨부"
                        required={photoRequired}
                        requiredTestID="request-photo-required-mark"
                        optional={!photoRequired}
                        optionalTestID="request-photo-optional-label"
                      />

                      {images.length === 0 ? (
                        <View
                          style={styles.tileRow}
                          testID="request-image-actions"
                        >
                          <RequestImageSourceTile
                            kind="gallery"
                            disabled={isPending}
                            onPress={() => addImage('gallery')}
                            testID="gallery-button"
                          />
                          <RequestImageSourceTile
                            kind="camera"
                            disabled={isPending}
                            onPress={() => addImage('camera')}
                            testID="camera-button"
                          />
                        </View>
                      ) : (
                        <View
                          style={styles.tileRow}
                          testID="request-image-list"
                        >
                          {Array.from({
                            length: getImageSlotCount(images.length),
                          }).map((_, index) => {
                            const image = images[index];

                            if (image) {
                              return (
                                <View
                                  key={`request-image-${image.sourceUri}-${index}`}
                                  style={styles.imageTile}
                                  testID="request-image-slot"
                                >
                                  <Image
                                    accessibilityLabel={`인증 사진 ${index + 1}`}
                                    testID="request-image-preview"
                                    source={{ uri: image.uri }}
                                    style={styles.preview}
                                    resizeMode="cover"
                                  />
                                  <Pressable
                                    accessibilityLabel={`인증 사진 ${index + 1} 삭제`}
                                    accessibilityRole="button"
                                    disabled={isPending}
                                    onPress={() => removeImage(index)}
                                    style={[
                                      styles.removeButtonArea,
                                      isPending && styles.removeButtonDisabled,
                                    ]}
                                    testID={`remove-request-image-${index}`}
                                  >
                                    <View style={styles.removeButton}>
                                      <RequestRemoveImageIcon />
                                    </View>
                                  </Pressable>
                                </View>
                              );
                            }

                            // 슬롯 수가 images.length < 2 ? 2 : 3 이므로 남는 슬롯은 항상 '+' 하나다.
                            return (
                              <Pressable
                                key="request-add-image"
                                accessibilityHint="앨범 선택 또는 카메라 촬영을 선택합니다"
                                accessibilityLabel="인증 사진 추가"
                                accessibilityRole="button"
                                accessibilityState={{
                                  disabled: !canAddImage,
                                }}
                                disabled={!canAddImage}
                                onPress={() => setIsSourceDialogVisible(true)}
                                style={[
                                  styles.addTile,
                                  !canAddImage && styles.addTileDisabled,
                                ]}
                                testID="request-add-image-button"
                              >
                                <RequestPlusIcon />
                              </Pressable>
                            );
                          })}
                        </View>
                      )}

                      <RequestImageSourceDialog
                        visible={isSourceDialogVisible}
                        onClose={() => setIsSourceDialogVisible(false)}
                        onSelect={addImage}
                      />
                    </ThemeView>
                  );
                }}
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
            </View>

            {hasMateTarget && (
              <ThemeView
                testID="request-message-section"
                style={styles.section}
                transparent
              >
                <SectionLabel
                  title="메시지"
                  optional
                  optionalTestID="request-message-optional-label"
                />
                <FormItem
                  name="message"
                  item={({ value, onChange }) => (
                    <Input
                      accessibilityLabel="메시지"
                      editable={!isPending}
                      fullWidth
                      inputStyle={styles.fieldInput}
                      maxLength={100}
                      multiline
                      onChangeText={onChange}
                      placeholder="메이트에게 남길 한 줄 메시지"
                      placeholderTextColor={requestFormColors.placeholder}
                      size="md"
                      style={styles.field}
                      value={value}
                      variant="filled"
                    />
                  )}
                />
              </ThemeView>
            )}

            <ThemeView
              testID="request-memo-section"
              style={styles.section}
              transparent
            >
              <SectionLabel
                title="메모"
                optional
                optionalTestID="request-memo-optional-label"
              />
              <FormItem
                name="memo"
                item={({ value, onChange }) => (
                  <Input
                    accessibilityLabel="메모"
                    editable={!isPending}
                    fullWidth
                    inputStyle={styles.fieldInput}
                    maxLength={100}
                    multiline
                    onChangeText={onChange}
                    placeholder="루틴 관련 메모를 작성하세요"
                    placeholderTextColor={requestFormColors.placeholder}
                    size="md"
                    style={styles.field}
                    value={value}
                    variant="filled"
                  />
                )}
              />
            </ThemeView>

            <RequetButtonGroup useForm={useForm} loading={isPending} />
          </View>
        </Form>
      </KeyboardAwareScrollView>
    </ThemeView>
  );
};

export default RequestModal;

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    paddingHorizontal: baseFoundation.spacing[6],
  },
  scroll: {
    paddingTop: baseFoundation.spacing[4] - HEADER_TITLE_CENTER_OFFSET,
    paddingBottom: baseFoundation.spacing[6],
  },
  // 피그마: (제목+사진) 블록 ↔ 메시지/메모 섹션 사이 48pt
  formBody: { gap: baseFoundation.spacing[12] },
  topGroup: { gap: baseFoundation.spacing[7] },
  summary: { gap: baseFoundation.spacing[2] },
  title: {
    color: requestFormColors.text,
    lineHeight: 27.2,
    letterSpacing: -0.4,
  },
  description: {
    color: requestFormColors.description,
    lineHeight: 20.4,
    letterSpacing: -0.3,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
    marginTop: baseFoundation.spacing[1],
  },
  targetName: {
    color: requestFormColors.text,
    lineHeight: 20.4,
    letterSpacing: -0.3,
  },
  section: { gap: baseFoundation.spacing[1] },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
  },
  label: {
    color: requestFormColors.label,
    lineHeight: 17.68,
    letterSpacing: -0.13,
  },
  requiredMark: {
    color: requestFormColors.required,
    lineHeight: 17.68,
    letterSpacing: -0.13,
    marginLeft: -baseFoundation.dimension.x2,
  },
  optionalLabel: {
    color: requestFormColors.label,
    lineHeight: 14.96,
    letterSpacing: -0.11,
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseFoundation.spacing[3],
  },
  // 사진 타일은 화면 너비에 따라 커지되 항상 1:1 비율을 유지한다.
  imageTile: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: requestFormColors.border,
    borderRadius: baseFoundation.radii.s,
    backgroundColor: requestFormColors.surface,
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: baseFoundation.radii.s - 1,
  },
  // 피그마 button_delete: 사진 우측 상단, 40x40 터치 영역 안에 24 원형 버튼(8 inset)
  removeButtonArea: {
    position: 'absolute',
    top: -baseFoundation.dimension.x1,
    right: -baseFoundation.dimension.x1,
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.radii.round,
    backgroundColor: requestFormColors.removeButton,
  },
  removeButtonDisabled: { opacity: baseFoundation.opacity.disabled },
  addTile: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: requestFormColors.border,
    borderRadius: baseFoundation.radii.s,
    backgroundColor: requestFormColors.surface,
  },
  addTileDisabled: { opacity: baseFoundation.opacity.disabled },
  uploadProgressTrack: {
    width: '100%',
    height: baseFoundation.dimension.x6,
    overflow: 'hidden',
    borderRadius: baseFoundation.radii.round,
    backgroundColor: requestFormColors.surface,
  },
  uploadProgressFill: {
    height: '100%',
    borderRadius: baseFoundation.radii.round,
    backgroundColor: requestFormColors.accent,
  },
  field: {
    minHeight: baseFoundation.dimension.x44,
    height: 'auto',
    paddingHorizontal: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[2],
    borderRadius: baseFoundation.radii.xs,
    backgroundColor: requestFormColors.surface,
  },
  fieldInput: {
    color: requestFormColors.text,
    fontSize: baseFoundation.typography.size.body1,
    lineHeight: 21.76,
    letterSpacing: -0.32,
    textAlignVertical: 'center',
  },
}));
