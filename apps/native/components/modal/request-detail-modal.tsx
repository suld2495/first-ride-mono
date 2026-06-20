import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import { getFormatDateTime } from '@repo/shared/utils';
import { useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Svg from 'react-native-svg';

import ConfirmRequestButtonGroup from '@/components/request/confirm-request-button-group';
import { Divider } from '@/components/ui/divider';
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
          <ThemeView style={styles.routinesNameContainer} transparent>
            <Typography
              variant="subtitle"
              weight="semibold"
              style={styles.infoLabel}
            >
              루틴 이름
            </Typography>
            <Typography>{detail?.routineName}</Typography>
            <Typography style={styles.routineDate} variant="body">
              {detail?.createdAt ? getFormatDateTime(detail.createdAt) : ''}
            </Typography>
          </ThemeView>
          <ThemeView transparent>
            <Typography>{detail?.routineDetail}</Typography>
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
            <Divider spacing={baseFoundation.spacing[5]} />
          </ThemeView>
          <Form form={{ comment: '' }}>
            <FormItem
              name="comment"
              label="응원의 한마디"
              item={({ value, onChange }) => (
                <Input
                  placeholder="응원의 한마디를 입력해주세요."
                  value={value}
                  onChangeText={onChange}
                  style={styles.textarea}
                  multiline
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

  routinesNameContainer: {
    position: 'relative',
  },

  routineDate: {
    position: 'absolute',
    top: baseFoundation.spacing[1],
    right: baseFoundation.spacing[0],
  },

  image: {
    width: '100%',
  },

  textarea: {
    height: baseFoundation.dimension.x100,
  },
});
