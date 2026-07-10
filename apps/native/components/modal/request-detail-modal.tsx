import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import { getFormatDateTime } from '@repo/shared/utils';
import { useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Svg from 'react-native-svg';

import ConfirmRequestButtonGroup from '@/components/request/confirm-request-button-group';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useCreateForm } from '@/hooks/useForm';
import { useRequestReply } from '@/hooks/useRequestReply';
import { useRequestId } from '@/hooks/useRequestSelection';
import { baseFoundation } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ comment: string }>();

const RequestDetailModal = () => {
  const requestId = useRequestId();
  const { data: detail, isLoading } = useFetchRequestDetailQuery(requestId);

  const user = useAuthUser();
  const [ratio, setRatio] = useState(1);
  const { handleSubmit } = useRequestReply({
    confirmId: detail?.id,
    nickname: user?.nickname || '',
  });

  useEffect(() => {
    if (!detail?.imagePath) return;

    Image.getSize(detail?.imagePath).then(({ width, height }) =>
      setRatio(width / height),
    );
  }, [detail?.imagePath]);

  if (isLoading) {
    return null;
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      enableResetScrollToCoords={false}
      showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
    >
      <ThemeView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <ThemeView style={styles.intro} transparent>
            <Typography variant="h3" weight="bold" style={styles.introTitle}>
              메이트가 보낸 인증이에요
            </Typography>
            <Typography variant="body2" style={styles.introDescription}>
              사진과 내용을 확인한 뒤 응원을 남겨 주세요.
            </Typography>
          </ThemeView>
          <ThemeView style={styles.summary}>
            <ThemeView style={styles.routinesNameContainer} transparent>
              <Typography
                variant="subtitle"
                weight="semibold"
                style={styles.infoLabel}
              >
                루틴 이름
              </Typography>
              <Typography
                variant="body1"
                weight="semibold"
                style={styles.routineName}
              >
                {detail?.routineName}
              </Typography>
              <Typography style={styles.routineDate} variant="caption1">
                {detail?.createdAt ? getFormatDateTime(detail.createdAt) : ''}
              </Typography>
            </ThemeView>
            <ThemeView transparent>
              <Typography variant="body2" style={styles.routineDescription}>
                {detail?.routineDetail}
              </Typography>
            </ThemeView>
          </ThemeView>
          <ThemeView transparent>
            {detail?.imagePath?.endsWith('svg') ? (
              <Svg.SvgUri
                uri={detail?.imagePath}
                style={[styles.image, { aspectRatio: ratio }]}
              />
            ) : (
              <Image
                source={{ uri: detail?.imagePath }}
                style={[styles.image, { aspectRatio: ratio }]}
              />
            )}
            <ThemeView style={styles.separator} />
          </ThemeView>
          <Form form={{ comment: '' }}>
            <FormItem
              name="comment"
              label="응원의 한마디"
              item={({ value, onChange }) => (
                <Input
                  accessibilityLabel="응원의 한마디"
                  fullWidth
                  inputStyle={styles.textareaInput}
                  placeholder="응원의 한마디를 입력해주세요."
                  value={value}
                  onChangeText={onChange}
                  style={styles.textarea}
                  multiline
                  variant="filled"
                />
              )}
            />

            <ConfirmRequestButtonGroup
              onSubmit={handleSubmit}
              useForm={useForm}
            />
          </Form>
        </ScrollView>
      </ThemeView>
    </KeyboardAwareScrollView>
  );
};

export default RequestDetailModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    marginTop: baseFoundation.spacing[5],
    paddingHorizontal: baseFoundation.spacing[5],
  },

  scroll: {
    gap: baseFoundation.spacing[5],
    paddingBottom: baseFoundation.spacing[12],
  },

  intro: {
    gap: baseFoundation.spacing[2],
  },

  introTitle: {
    color: theme.colors.brand.text,
  },

  introDescription: {
    color: theme.colors.text.muted,
  },

  summary: {
    paddingBottom: baseFoundation.spacing[5],
    gap: baseFoundation.spacing[3],
    borderBottomWidth: baseFoundation.dimension.x1,
    borderBottomColor: theme.colors.brand.card,
  },

  infoLabel: {
    color: theme.colors.text.muted,
    marginBottom: baseFoundation.spacing[3],
  },

  routinesNameContainer: {
    position: 'relative',
  },

  routineDate: {
    position: 'absolute',
    top: baseFoundation.spacing[1],
    right: baseFoundation.spacing[0],
    color: theme.colors.text.muted,
  },

  routineName: {
    color: theme.colors.brand.text,
  },

  routineDescription: {
    color: theme.colors.text.muted,
  },

  image: {
    width: '100%',
    borderRadius: baseFoundation.radii.m,
  },

  separator: {
    height: baseFoundation.dimension.x1,
    marginTop: baseFoundation.spacing[5],
    backgroundColor: theme.colors.brand.card,
  },

  textarea: {
    height: baseFoundation.dimension.x112,
    borderWidth: baseFoundation.dimension.x0,
    borderRadius: baseFoundation.radii.m,
    backgroundColor: theme.colors.brand.card,
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[3],
  },

  textareaInput: {
    textAlignVertical: 'top',
  },
}));
