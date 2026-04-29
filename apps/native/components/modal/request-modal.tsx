import Ionicons from '@expo/vector-icons/Ionicons';
import type { Validators } from '@repo/shared/components';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { requestFormValidators } from '@repo/shared/service/validatorMessage';
import { Image, Pressable, ScrollView } from 'react-native';

import RequetButtonGroup from '@/components/request/request-button-group';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useCreateForm } from '@/hooks/useForm';
import {
  type RequestImage,
  useRequestSubmission,
} from '@/hooks/useRequestSubmission';
import { useRoutineId } from '@/hooks/useRoutineSelection';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ images: RequestImage[] }>();
const requestImageValidators = requestFormValidators as unknown as Validators<{
  images: RequestImage[];
}>;

const RequestModal = () => {
  const routineId = useRoutineId();
  const { data: detail, isLoading } = useRoutineDetailQuery(routineId);
  const { handleSubmit, pickImage, takePicture } = useRequestSubmission(
    routineId,
    detail
      ? {
          nickname: detail.nickname,
          isMe: detail.isMe,
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
          <Typography variant="subtitle" style={styles.infoLabel}>
            루틴 이름
          </Typography>
          <Typography>{detail?.routineName}</Typography>
        </ThemeView>
        <ThemeView transparent>
          <Typography>{detail?.routineDetail}</Typography>
        </ThemeView>
        <ThemeView transparent>
          <Typography variant="subtitle" style={styles.infoLabel}>
            인증 대상
          </Typography>
          <Typography>{detail?.isMe ? '나' : detail?.mateNickname}</Typography>
          <Divider spacing={20} />
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
                    disabled={form.images.length >= 3}
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
                    disabled={form.images.length >= 3}
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
                            hitSlop={baseFoundation.dimension.x8}
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

          <RequetButtonGroup useForm={useForm} />
        </Form>
      </ScrollView>
    </ThemeView>
  );
};

export default RequestModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: baseFoundation.dimension.x30,
    paddingHorizontal: baseFoundation.dimension.x10,
  },

  scroll: {
    gap: baseFoundation.dimension.x20,
    paddingBottom: baseFoundation.dimension.x50,
  },

  infoLabel: {
    fontWeight: 'bold',
    marginBottom: baseFoundation.dimension.x10,
  },

  imageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: baseFoundation.dimension.x10,
  },

  phone: {
    paddingHorizontal: baseFoundation.spacing.s,
    paddingVertical: baseFoundation.dimension.x5,
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
    gap: baseFoundation.dimension.x10,
    width: '100%',
  },

  removeButton: {
    position: 'absolute',
    right: -baseFoundation.dimension.x12,
    top: -baseFoundation.dimension.x12,
    width: baseFoundation.dimension.x24,
    height: baseFoundation.dimension.x24,
    borderRadius: baseFoundation.dimension.x12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
});
