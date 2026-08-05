import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import { getFormatDateTime } from '@repo/shared/utils';
import { useEffect, useMemo, useState } from 'react';
import { Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Svg from 'react-native-svg';

import ConfirmRequestButtonGroup from '@/components/request/confirm-request-button-group';
import { Input } from '@/components/ui/input';
import { StyleSheet } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { MAX_REQUEST_IMAGE_COUNT } from '@/constants/REQUEST_IMAGE';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useCreateForm } from '@/hooks/useForm';
import { useRequestReply } from '@/hooks/useRequestReply';
import { useRequestId } from '@/hooks/useRequestSelection';
import { baseFoundation } from '@/theme/tokens';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ comment: string }>();
const REQUEST_IMAGE_RATIO_FALLBACK = 1;

const RequestDetailModal = () => {
  const requestId = useRequestId();
  const { data: detail, isLoading } = useFetchRequestDetailQuery(requestId);

  const user = useAuthUser();
  const imagePaths = useMemo(
    () => detail?.imagePaths?.slice(0, MAX_REQUEST_IMAGE_COUNT) ?? [],
    [detail?.imagePaths],
  );
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const initialForm = useMemo(() => ({ comment: '' }), []);
  const { handleSubmit, isPending, pendingStatus } = useRequestReply({
    confirmId: detail?.id,
    nickname: user?.nickname || '',
  });

  useEffect(() => {
    let isActive = true;

    if (!imagePaths.length) {
      setRatios({});
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
      if (!isActive) return;

      setRatios(Object.fromEntries(entries));
    });

    return () => {
      isActive = false;
    };
  }, [imagePaths]);

  if (isLoading) {
    return null;
  }

  return (
    <ThemeView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
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
        {detail?.message ? (
          <ThemeView testID="request-detail-message" style={styles.messageCard}>
            <Typography
              variant="body2"
              weight="semibold"
              style={styles.messageLabel}
            >
              메이트의 한마디
            </Typography>
            <Typography variant="body1" style={styles.messageText}>
              {detail.message}
            </Typography>
          </ThemeView>
        ) : null}
        {imagePaths.length ? (
          <ThemeView transparent>
            {imagePaths.map((imagePath, index) => (
              <ThemeView key={`${imagePath}-${index}`} transparent>
                {imagePath.endsWith('svg') ? (
                  <Svg.SvgUri
                    uri={imagePath}
                    style={[
                      styles.image,
                      {
                        aspectRatio:
                          ratios[imagePath] ?? REQUEST_IMAGE_RATIO_FALLBACK,
                      },
                    ]}
                  />
                ) : (
                  <Image
                    source={{ uri: imagePath }}
                    style={[
                      styles.image,
                      {
                        aspectRatio:
                          ratios[imagePath] ?? REQUEST_IMAGE_RATIO_FALLBACK,
                      },
                    ]}
                  />
                )}
              </ThemeView>
            ))}
            <ThemeView style={styles.separator} />
          </ThemeView>
        ) : null}
        <Form form={initialForm}>
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
            disabled={isPending}
            loadingStatus={pendingStatus}
            onSubmit={handleSubmit}
            useForm={useForm}
          />
        </Form>
      </KeyboardAwareScrollView>
    </ThemeView>
  );
};

export default RequestDetailModal;

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    marginTop: baseFoundation.spacing[5],
    paddingHorizontal: baseFoundation.spacing[6],
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

  messageCard: {
    gap: baseFoundation.spacing[2],
    paddingHorizontal: baseFoundation.spacing[4],
    paddingVertical: baseFoundation.spacing[4],
    borderRadius: baseFoundation.radii.m,
    backgroundColor: theme.colors.brand.card,
  },

  messageLabel: {
    color: theme.colors.text.muted,
  },

  messageText: {
    color: theme.colors.brand.text,
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
