import { Alert, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '@repo/shared/store/auth.store';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { feedbackColors, surfaceColors } from '@repo/design-system';

import { deletePushToken } from '@/api/push-token.api';
import { Button } from '@/components/common/Button';
import Link from '@/components/common/Link';
import ThemeView from '@/components/common/ThemeView';
import { Typography } from '@/components/common/Typography';
import Container from '@/components/layout/Container';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/hooks/useNotifications';

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
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
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
    ]);
  };

  return (
    <Container>
      <ThemeView style={styles.container}>
        <Typography variant="title">{user?.nickname}</Typography>
      </ThemeView>
      <ThemeView style={styles.linkContainer} transparent>
        <Link
          variant="ghost"
          href="/modal?type=policies"
          title="약관 및 정책"
          leftIcon={({ color }) => (
            <Ionicons name="newspaper-outline" size={20} color={color} />
          )}
          style={styles.link}
        />
        <Link
          variant="ghost"
          href="/modal?type=privacy"
          title="개인정보 처리방침"
          leftIcon={({ color }) => (
            <Ionicons name="key-outline" size={20} color={color} />
          )}
          style={styles.link}
        />
        <Button
          variant="ghost"
          title="처음처럼에 피드백을 남겨주세요!"
          leftIcon={({ color }) => (
            <Ionicons name="heart-circle-outline" size={20} color={color} />
          )}
          style={[styles.link, styles.feedback]}
          onPress={handleMoveFeedback}
        />
        <Button
          variant="ghost"
          title="로그아웃"
          leftIcon={() => (
            <Ionicons
              name="log-out-outline"
              size={20}
              color={feedbackColors.error.icon[colorScheme]}
            />
          )}
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
      alignItems: 'stretch',
    },

    linkContainer: {
      marginTop: 20,
    },

    link: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      alignSelf: 'stretch',
    },

    feedback: {
      backgroundColor: surfaceColors.raised[colorScheme],
    },

    logout: {
      backgroundColor: surfaceColors.raised[colorScheme],
      marginTop: 20,
    },
  });
