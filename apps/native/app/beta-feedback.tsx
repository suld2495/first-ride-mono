import Ionicons from '@expo/vector-icons/Ionicons';
import { useCreateBetaFeedbackMutation } from '@repo/shared/hooks/useBetaFeedback';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useToast } from '@/contexts/ToastContext';
import { baseFoundation, palette } from '@/theme/tokens';
import {
  type BetaFeedbackImage,
  normalizeBetaFeedbackImage,
} from '@/utils/beta-feedback-image';
import { getApiErrorMessage } from '@/utils/error-utils';

const MAX_FEEDBACK_LENGTH = 1000;
const MAX_FEEDBACK_IMAGE_COUNT = 3;
const FEEDBACK_GUIDES = [
  '어떤 화면에서',
  '무엇을 하던 중에',
  '어떤 일이 있었는지',
] as const;

const showPhotoPermissionAlert = () => {
  Alert.alert(
    '사진 접근 권한이 필요해요',
    '피드백에 이미지를 첨부하려면 사진 접근 권한을 허용해주세요.',
    [
      { text: '취소', style: 'cancel' },
      { text: '설정 열기', onPress: () => void Linking.openSettings() },
    ],
  );
};

const normalizePickedImages = async (
  assets: ImagePicker.ImagePickerAsset[],
  currentImages: BetaFeedbackImage[],
): Promise<{
  images: BetaFeedbackImage[];
  validationError: string | null;
}> => {
  const existingUris = new Set(currentImages.map(({ uri }) => uri));
  const normalizedImages: BetaFeedbackImage[] = [];
  let validationError: string | null = null;

  for (const asset of assets) {
    try {
      const image = await normalizeBetaFeedbackImage(asset);

      if (!existingUris.has(image.uri)) {
        existingUris.add(image.uri);
        normalizedImages.push(image);
      }
    } catch (error) {
      validationError =
        error instanceof Error
          ? error.message
          : '이미지를 불러오지 못했습니다.';
    }
  }

  return { images: normalizedImages, validationError };
};

export default function BetaFeedbackPage() {
  const { theme } = useAppTheme();
  const { showToast } = useToast();
  const createFeedbackMutation = useCreateBetaFeedbackMutation();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<BetaFeedbackImage[]>([]);

  const trimmedContent = useMemo(() => content.trim(), [content]);
  const isEmpty = trimmedContent.length === 0;
  const isTooLong = content.length > MAX_FEEDBACK_LENGTH;
  const validationMessage = isTooLong
    ? '피드백은 1000자 이하로 입력해주세요.'
    : isEmpty
      ? '피드백 내용을 입력해주세요.'
      : null;
  const validationMessageColor = isTooLong
    ? theme.colors.feedback.error.text
    : theme.colors.text.muted;
  const validationIconColor = isTooLong
    ? theme.colors.feedback.error.text
    : theme.colors.text.link;
  const canSubmit = !isEmpty && !isTooLong && !createFeedbackMutation.isPending;

  const handlePickImages = useCallback(async () => {
    const remainingImageCount = MAX_FEEDBACK_IMAGE_COUNT - images.length;

    if (remainingImageCount <= 0) {
      showToast('피드백 이미지는 최대 3장까지 첨부할 수 있습니다.', 'error');
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        showPhotoPermissionAlert();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingImageCount,
        orderedSelection: true,
      });

      if (result.canceled) {
        return;
      }

      const pickedAssets = result.assets.slice(0, remainingImageCount);
      const normalizedResult = await normalizePickedImages(
        pickedAssets,
        images,
      );
      const validationError =
        result.assets.length > remainingImageCount
          ? '피드백 이미지는 최대 3장까지 첨부할 수 있습니다.'
          : normalizedResult.validationError;

      if (normalizedResult.images.length > 0) {
        setImages((currentImages) => [
          ...currentImages,
          ...normalizedResult.images,
        ]);
      }

      if (validationError) {
        showToast(validationError, 'error');
      }
    } catch {
      showToast('이미지를 불러오지 못했습니다.', 'error');
    }
  }, [images, showToast]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) {
      return;
    }

    createFeedbackMutation.mutate(
      { content: trimmedContent, images },
      {
        onSuccess: () => {
          setContent('');
          setImages([]);
          showToast('피드백이 제출되었습니다.', 'success');
        },
        onError: (error) => {
          showToast(
            getApiErrorMessage(
              error,
              '피드백 제출에 실패했습니다. 잠시 후 다시 시도해주세요.',
            ),
            'error',
          );
        },
      },
    );
  }, [canSubmit, createFeedbackMutation, images, showToast, trimmedContent]);

  return (
    <Container noPadding>
      <PageHeader title="베타 피드백" showBackButton />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.formContent}>
            <View style={styles.intro}>
              <Typography style={styles.introTitle} variant="h3" weight="bold">
                작은 의견도 큰 도움이 돼요
              </Typography>
              <Typography style={styles.introDescription} variant="body2">
                불편했던 순간을 조금만 자세히 알려주세요.
              </Typography>
            </View>

            <View style={styles.guideSection}>
              <Typography
                style={styles.guideTitle}
                variant="body1"
                weight="semibold"
              >
                이렇게 적어주시면 좋아요
              </Typography>
              <View style={styles.guideList}>
                {FEEDBACK_GUIDES.map((guide, index) => (
                  <View key={guide} style={styles.guideRow}>
                    <Typography color="link" variant="body3" weight="semibold">
                      {index + 1}.
                    </Typography>
                    <Typography style={styles.guideText} variant="body2">
                      {guide}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.fieldSection}>
              <View style={styles.fieldLabelRow}>
                <Typography
                  style={styles.fieldLabel}
                  variant="body2"
                  weight="semibold"
                >
                  피드백 내용
                </Typography>
                <Typography color="link" variant="caption1" weight="semibold">
                  필수
                </Typography>
              </View>
              <Input
                accessibilityLabel="피드백 내용"
                containerTestID="beta-feedback-content-field"
                error={isTooLong}
                fullWidth
                inputStyle={styles.feedbackInput}
                multiline
                onChangeText={setContent}
                placeholder="사용하면서 불편했던 점이나 오류를 자유롭게 알려주세요."
                returnKeyType="default"
                style={[
                  styles.feedbackInputContainer,
                  !isTooLong && styles.feedbackInputBorder,
                ]}
                testID="beta-feedback-content-input"
                textAlignVertical="top"
                value={content}
              />
              <View
                style={styles.fieldMeta}
                testID="beta-feedback-field-meta-row"
              >
                {validationMessage ? (
                  <View
                    style={styles.validationRow}
                    testID="beta-feedback-validation-row"
                  >
                    <Ionicons
                      accessibilityElementsHidden
                      color={validationIconColor}
                      name="alert-circle-outline"
                      size={theme.foundation.iconSize.m}
                      style={styles.validationIcon}
                      testID="beta-feedback-validation-icon"
                    />
                    <Typography
                      color={validationMessageColor}
                      style={styles.validationMessage}
                      variant="caption1"
                    >
                      {validationMessage}
                    </Typography>
                  </View>
                ) : null}
                <Typography
                  color={isTooLong ? 'error' : theme.colors.text.muted}
                  testID="beta-feedback-character-count"
                  variant="caption1"
                >
                  {content.length} / {MAX_FEEDBACK_LENGTH}
                </Typography>
              </View>
            </View>

            <View style={styles.attachmentSection}>
              <View style={styles.attachmentHeader}>
                <View style={styles.attachmentTitleRow}>
                  <Typography
                    style={styles.fieldLabel}
                    variant="body2"
                    weight="semibold"
                  >
                    이미지 첨부
                  </Typography>
                  <Typography
                    color={theme.colors.text.muted}
                    variant="caption1"
                  >
                    선택
                  </Typography>
                </View>
                <Typography color="link" variant="caption1" weight="semibold">
                  {images.length} / {MAX_FEEDBACK_IMAGE_COUNT}
                </Typography>
              </View>

              <Typography
                color={theme.colors.text.muted}
                style={styles.attachmentGuide}
                variant="caption1"
              >
                JPG, PNG, WEBP, HEIC · 장당 최대 10MB
              </Typography>

              {images.length > 0 ? (
                <View style={styles.previewList}>
                  {images.map((image, index) => (
                    <View key={image.uri} style={styles.previewItem}>
                      <Image
                        resizeMode="cover"
                        source={{ uri: image.uri }}
                        style={styles.previewImage}
                        testID="beta-feedback-image-preview"
                      />
                      <Pressable
                        accessibilityLabel={`첨부 이미지 ${index + 1} 삭제`}
                        accessibilityRole="button"
                        disabled={createFeedbackMutation.isPending}
                        hitSlop={baseFoundation.spacing[2]}
                        onPress={() => handleRemoveImage(index)}
                        style={styles.removeImageButton}
                      >
                        <Ionicons
                          color={palette.white}
                          name="close"
                          size={baseFoundation.iconSize.s}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : null}

              <Button
                accessibilityHint="앨범에서 이미지를 선택합니다"
                accessibilityLabel="피드백 이미지 추가"
                disabled={
                  createFeedbackMutation.isPending ||
                  images.length >= MAX_FEEDBACK_IMAGE_COUNT
                }
                fullWidth
                leftIcon={({ color }) => (
                  <Ionicons
                    color={color}
                    name="images-outline"
                    size={baseFoundation.iconSize.m}
                  />
                )}
                onPress={() => void handlePickImages()}
                size="md"
                testID="beta-feedback-image-picker"
                variant="outline"
              >
                {images.length > 0 ? '사진 더 추가' : '사진 추가'}
              </Button>
            </View>
          </View>

          <Button
            accessibilityLabel="피드백 보내기"
            disabled={!canSubmit}
            fullWidth
            loading={createFeedbackMutation.isPending}
            onPress={handleSubmit}
            size="lg"
            testID="beta-feedback-submit-button"
          >
            피드백 보내기
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  keyboardArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[6],
    paddingHorizontal: theme.foundation.spacing[5],
    paddingTop: theme.foundation.spacing[4],
    paddingBottom: theme.foundation.spacing[8],
  },
  formContent: {
    gap: theme.foundation.spacing[5],
  },
  intro: {
    gap: theme.foundation.spacing[2],
    paddingBottom: theme.foundation.spacing[1],
  },
  introTitle: {
    color: theme.colors.brand.text,
  },
  introDescription: {
    color: theme.colors.text.muted,
  },
  guideSection: {
    gap: theme.foundation.spacing[3],
    borderTopWidth: baseFoundation.dimension.x1,
    borderTopColor: `${palette.theme.gray[90]}80`,
    paddingTop: theme.foundation.spacing[4],
  },
  guideList: {
    gap: theme.foundation.spacing[3],
  },
  guideTitle: {
    color: theme.colors.brand.text,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  guideText: {
    color: theme.colors.brand.text,
  },
  fieldSection: {
    gap: theme.foundation.spacing[2],
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
    paddingHorizontal: theme.foundation.spacing[1],
  },
  fieldLabel: {
    color: theme.colors.brand.text,
  },
  feedbackInputContainer: {
    height: baseFoundation.dimension.x250,
    paddingHorizontal: theme.foundation.spacing[3],
    paddingVertical: theme.foundation.spacing[3],
  },
  feedbackInputBorder: {
    borderColor: palette.theme.gray[8],
  },
  feedbackInput: {
    minHeight: baseFoundation.dimension.x220,
    fontSize: theme.foundation.typography.size.m,
    lineHeight:
      theme.foundation.typography.size.m *
      theme.foundation.typography.lineHeight.normal,
  },
  fieldMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.foundation.spacing[1],
  },
  attachmentSection: {
    gap: theme.foundation.spacing[2],
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.foundation.spacing[1],
  },
  attachmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  attachmentGuide: {
    paddingHorizontal: theme.foundation.spacing[1],
  },
  previewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.foundation.spacing[3],
    paddingTop: theme.foundation.spacing[1],
    paddingHorizontal: theme.foundation.spacing[1],
  },
  previewItem: {
    position: 'relative',
  },
  previewImage: {
    width: baseFoundation.dimension.x96,
    height: baseFoundation.dimension.x96,
    borderRadius: theme.foundation.radii.s,
    backgroundColor: theme.colors.background.media,
  },
  removeImageButton: {
    position: 'absolute',
    top: -theme.foundation.spacing[2],
    right: -theme.foundation.spacing[2],
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.foundation.radii.round,
    backgroundColor: `${palette.black}B8`,
  },
  validationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
    marginRight: theme.foundation.spacing[2],
  },
  validationMessage: {
    flexShrink: 1,
  },
  validationIcon: {
    flexShrink: 0,
  },
}));
