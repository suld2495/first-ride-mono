import { useFetchRequestDetailQuery } from '@repo/shared/hooks/useRequest';
import { getFormatDateTime } from '@repo/shared/utils';
import { useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Svg from 'react-native-svg';
import { StyleSheet } from '@/lib/unistyles';

import ConfirmRequestButtonGroup from '@/components/request/confirm-request-button-group';
import { Divider } from '@/components/ui/divider';
import { Input } from '@/components/ui/input';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useCreateForm } from '@/hooks/useForm';
import { useRequestReply } from '@/hooks/useRequestReply';
import { useRequestId } from '@/hooks/useRequestSelection';

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
    >
      <ThemeView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemeView style={styles.routinesNameContainer} transparent>
            <Typography variant="subtitle" style={styles.infoLabel}>
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
            {detail?.imagePath.endsWith('svg') ? (
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
            <Divider spacing={20} />
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

  routinesNameContainer: {
    position: 'relative',
  },

  routineDate: {
    position: 'absolute',
    top: 5,
    right: 0,
  },

  image: {
    width: '100%',
  },

  textarea: {
    height: 100,
  },
});
