import Ionicons from '@expo/vector-icons/Ionicons';
import { useRoutineDetailQuery } from '@repo/shared/hooks/useRoutine';
import { requestFormValidators } from '@repo/shared/service/validatorMessage';
import { Image, ScrollView } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

import RequetButtonGroup from '@/components/request/request-button-group';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useCreateForm } from '@/hooks/useForm';
import { useRequestSubmission } from '@/hooks/useRequestSubmission';
import { useRoutineId } from '@/hooks/useRoutineSelection';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ image: string }>();

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
          form={{ image: '' }}
          onSubmit={handleSubmit}
          validators={requestFormValidators}
        >
          <FormItem
            name="image"
            label="이미지 업로드"
            item={({ form, setValue }) => (
              <>
                <ThemeView style={styles.imageContainer} transparent>
                  <Button
                    testID="gallery-button"
                    variant="secondary"
                    leftIcon={({ color }) => (
                      <Ionicons name="image-outline" size={20} color={color} />
                    )}
                    style={styles.phone}
                    onPress={() => pickImage(setValue)}
                  />
                  <Button
                    testID="camera-button"
                    variant="secondary"
                    leftIcon={({ color }) => (
                      <Ionicons name="camera-outline" size={20} color={color} />
                    )}
                    style={styles.phone}
                    onPress={() => takePicture(setValue)}
                  />
                </ThemeView>
                {form.image && (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${form.image}` }}
                    style={styles.preview}
                  />
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
    marginTop: 30,
    paddingHorizontal: 10,
  },

  scroll: {
    gap: 20,
    paddingBottom: 50,
  },

  infoLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
  },

  imageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },

  phone: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
  },
});
