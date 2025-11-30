import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Svg from 'react-native-svg';
import {
  useFetchRequestDetailQuery,
  useReplyRequestMutation,
} from '@repo/shared/hooks/useRequest';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { useRequestStore } from '@repo/shared/store/request.store';
import { RequestResponseStatus } from '@repo/types';
import { useRouter } from 'expo-router';

import { useToast } from '@/contexts/ToastContext';
import { useCreateForm } from '@/hooks/useForm';

import { Divider } from '../common/Divider';
import { Input } from '../common/Input';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';
import ConfirmRequestButtonGroup from '../request/ConfirmRequestButtonGroup';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { Form, FormItem, useForm } = useCreateForm<{ comment: string }>();

const RequestDetailModal = () => {
  const { showToast } = useToast();

  const requestId = useRequestStore((state) => state.requestId);
  const { data: detail, isLoading } = useFetchRequestDetailQuery(requestId);

  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const replyRequest = useReplyRequestMutation(user?.nickname || '');
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    if (!detail?.imagePath) return;

    Image.getSize(detail?.imagePath).then(({ width, height }) =>
      setRatio(width / height),
    );
  }, [detail?.imagePath]);

  if (isLoading) {
    return null;
  }

  const handleSubmit = async (
    status: RequestResponseStatus,
    comment: string,
  ) => {
    try {
      await replyRequest.mutateAsync({
        confirmId: detail!.id,
        checkStatus: status,
        checkComment: comment,
      });

      if (status === 'PASS') {
        showToast('승인되었습니다.', 'success');
      } else {
        showToast('거절되었습니다.', 'success');
      }

      router.back();
    } catch {
      showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
  };

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
              {detail?.createdAt}
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
