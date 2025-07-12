import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Svg from 'react-native-svg';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import {
  useFetchRequestDetailQuery,
  useReplyRequestMutation,
} from '@repo/shared/hooks/useRequest';
import { useRequestStore } from '@repo/shared/store/request.store';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';

import { Button } from '../common/Button';
import FormItem from '../common/form/FormItem';
import ThemeText from '../common/ThemeText';
import ThemeTextInput from '../common/ThemeTextInput';
import ThemeView from '../common/ThemeView';
import { RequestResponseStatus } from '@repo/types';

const RequestDetailModal = () => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const requestId = useRequestStore((state) => state.requestId);
  const { data: detail, isLoading } = useFetchRequestDetailQuery(requestId);

  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const replyRequest = useReplyRequestMutation(user?.name || '');
  const [comment, setComment] = useState('');
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

  const handleSubmit = async (status: RequestResponseStatus) => {
    try {
      await replyRequest.mutateAsync({
        confirmId: detail?.id,
        checkStatus: status,
        checkComment: comment,
      });

      if (status === 'PASS') {
        Alert.alert('승인되었습니다.');
      } else {
        Alert.alert('거절되었습니다.');
      }

      router.back();
    } catch {
      Alert.alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <ThemeView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemeView style={styles.routinesNameContainer}>
            <ThemeText
              variant="subtitle"
              style={[styles.info, styles.infoLabel]}
            >
              루틴 이름
            </ThemeText>
            <ThemeText style={styles.info}>{detail?.routineName}</ThemeText>
            <ThemeText
              style={[styles.info, styles.routineDate]}
              variant="medium"
            >
              {detail?.createdAt}
            </ThemeText>
          </ThemeView>
          <ThemeView>
            <ThemeText style={styles.info}>{detail?.routineDetail}</ThemeText>
          </ThemeView>
          <ThemeView style={styles.line}>
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
          </ThemeView>
          <FormItem label="응원의 한마디">
            <ThemeTextInput
              placeholder="응원의 한마디를 입력해주세요."
              value={comment}
              onChangeText={setComment}
              style={styles.textarea}
              multiline
            />
          </FormItem>
          <ThemeView style={styles.buttonContainer}>
            <Button
              title="승인"
              onPress={() => handleSubmit('PASS')}
              style={[styles.addButton, styles.button]}
            />
            <Button
              title="거절"
              onPress={() => handleSubmit('DENY')}
              style={[styles.cancelButton, styles.button]}
            />
          </ThemeView>
        </ScrollView>
      </ThemeView>
    </KeyboardAwareScrollView>
  );
};

export default RequestDetailModal;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 30,
      paddingHorizontal: 10,
    },

    scroll: {
      gap: 20,
      paddingBottom: 50,
    },

    line: {
      paddingBottom: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS[colorScheme].grey,
    },

    infoLabel: {
      fontWeight: 'bold',
      marginBottom: 10,
    },

    info: {
      color: COLORS[colorScheme].text,
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

    buttonContainer: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
    },

    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    date_button: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    button: {
      flex: 1,
    },

    cancelButton: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    addButton: {
      backgroundColor: COLORS[colorScheme].button,
    },
  });
