import { Alert } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { deletePushToken } from '@/api/push-token.api';
import { Button } from '@/components/common/Button';
import Link from '@/components/common/Link';
import PixelCard from '@/components/common/PixelCard';
import PixelText from '@/components/common/PixelText';
import ThemeView from '@/components/common/ThemeView';
import Container from '@/components/layout/Container';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/store/auth.store';

const MyInfo = () => {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { pushToken } = useNotifications();
  const { theme } = useUnistyles();

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
            await deletePushToken(pushToken.data);
          }

          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Container>
      <ThemeView style={styles.container}>
        <PixelText variant="title" glow>{user?.nickname}</PixelText>
      </ThemeView>
      <PixelCard style={styles.linkContainer}>
        <Link
          variant="ghost"
          href="/modal?type=theme"
          title="테마 설정"
          leftIcon={({ color }) => (
            <Ionicons name="color-palette-outline" size={20} color={color} />
          )}
          style={styles.link}
        />
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
          style={styles.link}
          onPress={handleMoveFeedback}
        />
      </PixelCard>
      <PixelCard style={styles.logoutContainer}>
        <Button
          variant="ghost"
          title="로그아웃"
          leftIcon={() => (
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.feedback.error.text}
            />
          )}
          style={styles.link}
          onPress={handleLogout}
        />
      </PixelCard>
    </Container>
  );
};

export default MyInfo;

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'stretch',
    paddingHorizontal: theme.foundation.spacing.m,
  },

  linkContainer: {
    marginTop: theme.foundation.spacing.l,
  },

  logoutContainer: {
    marginTop: theme.foundation.spacing.m,
  },

  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
}));
