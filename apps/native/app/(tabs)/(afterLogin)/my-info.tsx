import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, View } from 'react-native';

import { deletePushToken } from '@/api/push-token.api';
import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import PixelCard from '@/components/ui/pixel-card';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { useAuthSignOut } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import { baseFoundation } from '@/theme/tokens';

const MyInfo = () => {
  const signOut = useAuthSignOut();
  const { pushToken } = useNotifications();
  const { theme } = useAppTheme();

  const handleMoveFeedback = async () => {
    const extra = Constants.expoConfig?.extra as
      | { feedback?: string }
      | undefined;
    const feedbackUrl = extra?.feedback;

    if (typeof feedbackUrl !== 'string' || feedbackUrl.length === 0) {
      return;
    }

    await WebBrowser.openBrowserAsync(feedbackUrl);
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
          try {
            // 로그아웃 시 푸시 토큰 삭제
            if (pushToken?.data) {
              await deletePushToken(pushToken.data);
            }
          } catch {
            // 푸시 토큰 삭제 실패 여부와 관계없이 로그아웃은 계속 진행
          }

          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  return (
    <Container noPadding>
      <Header />
      <View style={styles.content}>
        <PixelCard style={styles.linkContainer}>
          <Link
            variant="ghost"
            href="/account"
            title="계정"
            leftIcon={({ color }) => (
              <Ionicons
                name="person-circle-outline"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            style={styles.link}
          />
          <Link
            variant="ghost"
            href="/modal?type=theme"
            title="테마 설정"
            leftIcon={({ color }) => (
              <Ionicons
                name="color-palette-outline"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            style={styles.link}
          />
          <Link
            variant="ghost"
            href="/modal?type=policies"
            title="약관 및 정책"
            leftIcon={({ color }) => (
              <Ionicons
                name="newspaper-outline"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            style={styles.link}
          />
          <Link
            variant="ghost"
            href="/modal?type=privacy"
            title="개인정보 처리방침"
            leftIcon={({ color }) => (
              <Ionicons
                name="key-outline"
                size={baseFoundation.iconSize.m}
                color={color}
              />
            )}
            style={styles.link}
          />
          <Button
            variant="ghost"
            title="처음처럼에 피드백을 남겨주세요!"
            leftIcon={({ color }) => (
              <Ionicons
                name="heart-circle-outline"
                size={baseFoundation.iconSize.m}
                color={color}
              />
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
                size={baseFoundation.iconSize.m}
                color={theme.colors.feedback.error.text}
              />
            )}
            style={styles.link}
            onPress={handleLogout}
          />
        </PixelCard>
      </View>
    </Container>
  );
};

export default MyInfo;

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'stretch',
  },
  content: {
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
