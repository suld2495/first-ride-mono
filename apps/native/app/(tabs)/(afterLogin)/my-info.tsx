import { StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';

import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import ThemeText from '@/components/common/ThemeText';
import ThemeView from '@/components/common/ThemeView';
import Container from '@/components/layout/Container';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';
import { deletePushToken } from '@/api/push-token.api';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';

const MyInfo = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { pushToken } = useNotifications();
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const handleMoveFeedback = async () => {
    await WebBrowser.openBrowserAsync(Constants.expoConfig?.extra?.feedback);
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            // 로그아웃 시 푸시 토큰 삭제
            if (pushToken?.data) {
              try {
                await deletePushToken(pushToken.data);
              } catch (error) {
                console.error('Failed to delete push token on logout:', error);
              }
            }

            signOut();
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <Container>
      <ThemeView style={styles.container}>
        <ThemeText variant="title">{user?.nickname}</ThemeText>
      </ThemeView>
      <ThemeView style={styles.linkContainer}>
        <Link
          variant="plain"
          href="/modal?type=policies"
          title="약관 및 정책"
          icon={
            <Ionicons
              name="newspaper-outline"
              size={20}
              color={COLORS[colorScheme].icon}
            />
          }
          iconGap={15}
          style={styles.link}
        />
        <Link
          variant="plain"
          href="/modal?type=privacy"
          title="개인정보 처리방침"
          icon={
            <Ionicons
              name="key-outline"
              size={20}
              color={COLORS[colorScheme].icon}
            />
          }
          iconGap={15}
          style={styles.link}
        />
        <Button
          variant="plain"
          title="처음처럼에 피드백을 남겨주세요!"
          icon={
            <Ionicons
              name="heart-circle-outline"
              size={20}
              color={COLORS[colorScheme].icon}
            />
          }
          iconGap={15}
          style={[styles.link, styles.feedback]}
          onPress={handleMoveFeedback}
        />
        <Button
          variant="plain"
          title="로그아웃"
          icon={
            <Ionicons
              name="log-out-outline"
              size={20}
              color={COLORS[colorScheme].error}
            />
          }
          iconGap={15}
          style={[styles.link, styles.logout]}
          onPress={handleLogout}
        />
      </ThemeView>
    </Container>
  );
};

export default MyInfo;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
    },

    linkContainer: {
      marginTop: 20,
    },

    link: {
      alignItems: 'flex-start',
    },

    feedback: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
    },

    logout: {
      backgroundColor: COLORS[colorScheme].backgroundGrey,
      marginTop: 20,
    },
  });
