import Ionicons from '@expo/vector-icons/Ionicons';
import type { Validators } from '@repo/shared/components';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { requestFormValidators } from '@repo/shared/service/validatorMessage';
import { Image, Pressable, ScrollView } from 'react-native';

import RequetButtonGroup from '@/components/request/request-button-group';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useCreateForm } from '@/hooks/useForm';
import {
  type RequestImage,
  useRequestSubmission,
} from '@/hooks/useRequestSubmission';
import { useRoutineId } from '@/hooks/useRoutineSelection';
import { baseFoundation } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ images: RequestImage[] }>();
const requestImageValidators = requestFormValidators as unknown as Validators<{
  images: RequestImage[];
}>;

const RequestModal = () => {
  const routineId = useRoutineId();
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);
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
    <ThemeView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ThemeView transparent>
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.infoLabel}
          >
            루틴 이름
          </Typography>
          <Typography>{detail?.routineName}</Typography>
        </ThemeView>
        <ThemeView transparent>
          <Typography>{detail?.routineDetail}</Typography>
        </ThemeView>
        <ThemeView transparent>
          <Typography
            variant="subtitle"
            weight="semibold"
            style={styles.infoLabel}
          >
            인증 대상
          </Typography>
          <Typography>{detail?.isMe ? '나' : detail?.mateNickname}</Typography>
          <Divider spacing={baseFoundation.spacing[5]} />
        </ThemeView>

        <Form
          form={{ images: [] }}
          onSubmit={handleSubmit}
          validators={requestImageValidators}
        >
          <FormItem
            name="images"
            label="이미지 업로드"
            item={({ form, setValue }) => (
              <>
                <ThemeView style={styles.imageContainer} transparent>
                  <Button
                    testID="gallery-button"
                    variant="secondary"
                    leftIcon={({ color }) => (
                      <Ionicons
                        name="image-outline"
                        size={baseFoundation.iconSize.m}
                        color={color}
                      />
                    )}
                    style={styles.phone}
                    disabled={isPending || form.images.length >= 3}
                    onPress={() => pickImage(setValue, form.images)}
                  />
                  <Button
                    testID="camera-button"
                    variant="secondary"
                    leftIcon={({ color }) => (
                      <Ionicons
                        name="camera-outline"
                        size={baseFoundation.iconSize.m}
                        color={color}
                      />
                    )}
                    style={styles.phone}
                    disabled={isPending || form.images.length >= 3}
                    onPress={() => takePicture(setValue, form.images)}
                  />
                </ThemeView>
                {form.images.length > 0 && (
                  <ThemeView style={styles.previewList} transparent>
                    {form.images.map((image, index) => {
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
                          key={`${image.previewUri}-${index}`}
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
                            hitSlop={baseFoundation.spacing[2]}
                            onPress={handleRemoveImage}
                            style={styles.removeButton}
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
                )}
              </>
            )}
          />

          <RequetButtonGroup useForm={useForm} loading={isPending} />
        </Form>
      </ScrollView>
    </ThemeView>
  );
};

export default RequestModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: baseFoundation.spacing[7],
    paddingHorizontal: baseFoundation.spacing[2.5],
  },

  scroll: {
    gap: baseFoundation.spacing[5],
    paddingBottom: baseFoundation.spacing[12],
  },

  infoLabel: {
    fontWeight: 'bold',
    marginBottom: baseFoundation.spacing[2.5],
  },

  imageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: baseFoundation.spacing[2.5],
  },

  phone: {
    paddingHorizontal: baseFoundation.spacing[2],
    paddingVertical: baseFoundation.spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
  },

  preview: {
    width: baseFoundation.dimension.x100,
    height: baseFoundation.dimension.x100,
    borderRadius: baseFoundation.dimension.x5,
  },

  previewItem: {
    position: 'relative',
  },

  previewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: baseFoundation.spacing[2.5],
    width: '100%',
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
});
