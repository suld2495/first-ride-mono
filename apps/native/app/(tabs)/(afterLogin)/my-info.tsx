import { useMyStatsQuery } from '@repo/shared/hooks/useStat';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import type { UserLoginType } from '@repo/types';
import { router, useFocusEffect } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { deletePushToken } from '@/api/push-token.api';
import Container from '@/components/layout/container';
import Header from '@/components/layout/header';
import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { useAuthSignOut, useAuthUser } from '@/hooks/useAuthSession';
import { useNotifications } from '@/hooks/useNotifications';
import { baseFoundation, palette } from '@/theme/tokens';

const FALLBACK_LEVEL = 1;
const FALLBACK_EXP = 0;
const FALLBACK_NEXT_LEVEL_EXP = 30;

const SOCIAL_LOGIN_TYPE_LABELS: Record<
  Exclude<UserLoginType, 'PLAIN'>,
  string
> = {
  KAKAO: '카카오',
  APPLE: 'Apple',
  GOOGLE: 'Google',
  NAVER: '네이버',
};

const SOCIAL_LOGIN_TYPE_COLORS: Partial<
  Record<
    Exclude<UserLoginType, 'PLAIN'>,
    { backgroundColor: string; textColor: string }
  >
> = {
  KAKAO: { backgroundColor: '#FEE500', textColor: '#000000' },
  APPLE: { backgroundColor: '#000000', textColor: '#FFFFFF' },
};

const SETTING_ITEMS: Array<{
  title: string;
  href?: Href;
}> = [
  { title: '한마디', href: '/modal?type=account' },
  { title: '루틴 설정', href: '/routine-settings' },
  { title: '알림 설정', href: '/notification-settings' },
  { title: '이용약관', href: '/modal?type=policies' },
  { title: '개인정보 처리방침', href: '/modal?type=privacy' },
  { title: '문의', href: '/inquiry' },
  { title: '영웅의 전당', href: '/hall-of-heroes' },
];

type ThemeTone = 'blue' | 'green' | 'red';

const getThemeTone = (themeName?: string): ThemeTone => {
  if (themeName === 'green' || themeName === 'red') {
    return themeName;
  }

  return 'blue';
};

const getThemePalette = (themeTone: ThemeTone) => {
  switch (themeTone) {
    case 'green':
      return {
        themeColor: palette.theme.green,
        softThemeColor: palette.theme.softGreen,
      };
    case 'red':
      return {
        themeColor: palette.theme.red,
        softThemeColor: palette.theme.softRed,
      };
    default:
      return {
        themeColor: palette.theme.blue,
        softThemeColor: palette.theme.softBlue,
      };
  }
};

const MyInfo = () => {
  const signOut = useAuthSignOut();
  const user = useAuthUser();
  const { data: currentUser } = useFetchMeQuery(user?.userId);
  const { pushToken } = useNotifications();
  const { data: stats, refetch: refetchMyStats } = useMyStatsQuery();
  const { theme } = useAppTheme();
  const currentExp = stats?.currentLevelProgress ?? FALLBACK_EXP;
  const nextLevelExp = stats?.expForNextLevel ?? FALLBACK_NEXT_LEVEL_EXP;
  const expProgress =
    nextLevelExp > 0 ? Math.min(currentExp / nextLevelExp, 1) : 0;
  const themeTone = getThemeTone(theme.name);
  const { themeColor, softThemeColor } = getThemePalette(themeTone);
  const characterAsset = getRoutineSceneRemoteAsset(
    currentUser?.characterImageUrl,
  );
  const socialLoginType =
    currentUser?.loginType && currentUser.loginType !== 'PLAIN'
      ? SOCIAL_LOGIN_TYPE_LABELS[currentUser.loginType]
      : null;
  const socialLoginTypeColors =
    currentUser?.loginType && currentUser.loginType !== 'PLAIN'
      ? SOCIAL_LOGIN_TYPE_COLORS[currentUser.loginType]
      : null;

  useFocusEffect(
    useCallback(() => {
      void refetchMyStats();
    }, [refetchMyStats]),
  );

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
        },
      },
    ]);
  };

  return (
    <Container noPadding style={styles.container}>
      <Header title="설정" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        testID="settings-scroll-view"
      >
        <View testID="settings-profile" style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View
              accessibilityLabel="프로필 이미지"
              testID="settings-profile-avatar"
              style={styles.avatar}
            >
              {characterAsset
                ? renderRoutineSceneAsset(characterAsset, {
                    testID: 'settings-profile-character',
                    style: styles.character,
                  })
                : null}
            </View>
            <View testID="settings-profile-text" style={styles.profileText}>
              <Typography
                color={palette.theme.gray[80]}
                testID="settings-profile-name"
                variant="body2"
                weight="semibold"
              >
                {user?.nickname}
              </Typography>
              {currentUser?.loginType === 'PLAIN' ? (
                <Typography
                  color={softThemeColor[50]}
                  testID="settings-profile-user-id"
                  variant="caption1"
                  weight="semibold"
                >
                  {currentUser.userId}
                </Typography>
              ) : socialLoginType ? (
                <View
                  testID="settings-profile-login-type-badge"
                  style={[
                    styles.loginTypeBadge,
                    {
                      backgroundColor:
                        socialLoginTypeColors?.backgroundColor ??
                        softThemeColor[20],
                    },
                  ]}
                >
                  <Typography
                    color={socialLoginTypeColors?.textColor ?? themeColor[80]}
                    testID="settings-profile-login-type-text"
                    variant="caption2"
                    weight="semibold"
                  >
                    {socialLoginType}
                  </Typography>
                </View>
              ) : null}
            </View>
          </View>

          <View testID="settings-level-row" style={styles.levelRow}>
            <View testID="settings-level-badge" style={styles.levelBadge}>
              <Typography
                color={themeColor[80]}
                testID="settings-level-text"
                variant="caption2"
                weight="semibold"
              >
                Lv. {stats?.currentLevel ?? FALLBACK_LEVEL}
              </Typography>
            </View>
          </View>

          <View testID="settings-exp-row" style={styles.expLabelRow}>
            <View testID="settings-exp-title-row" style={styles.expTitleRow}>
              <Typography
                color={themeColor[80]}
                testID="settings-exp-label"
                variant="body3"
                weight="semibold"
              >
                경험치
              </Typography>
              <Typography
                color={softThemeColor[60]}
                testID="settings-exp-unit"
                variant="caption2"
                weight="semibold"
              >
                EXP
              </Typography>
            </View>
            <View testID="settings-exp-value-row" style={styles.expValueRow}>
              <Typography
                color={softThemeColor[80]}
                testID="settings-exp-current"
                variant="caption2"
                weight="semibold"
              >
                {currentExp}
              </Typography>
              <Typography
                color={softThemeColor[80]}
                variant="caption2"
                weight="semibold"
              >
                /
              </Typography>
              <Typography
                color={softThemeColor[80]}
                testID="settings-exp-next"
                variant="caption2"
                weight="semibold"
              >
                {nextLevelExp}
              </Typography>
            </View>
          </View>

          <View
            testID="settings-progress-track"
            style={[
              styles.progressTrack,
              { backgroundColor: softThemeColor[40] },
            ]}
          >
            <View
              testID="settings-progress-fill"
              style={[
                styles.progressFill,
                {
                  width: `${expProgress * 100}%`,
                  backgroundColor: themeColor[50],
                },
              ]}
            />
          </View>
        </View>

        <View
          testID="settings-divider"
          style={[styles.divider, { backgroundColor: softThemeColor[20] }]}
        />

        <View testID="settings-menu-list" style={styles.menuList}>
          {SETTING_ITEMS.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.title}
              onPress={() => {
                if (item.href) {
                  router.push(item.href);
                }
              }}
              testID={`settings-menu-item-${item.title}`}
              style={styles.menuItem}
            >
              <View style={styles.menuItemContent}>
                <Typography
                  color={palette.theme.gray[60]}
                  testID={`settings-menu-text-${item.title}`}
                  variant="body2"
                  weight="semibold"
                >
                  {item.title}
                </Typography>
              </View>
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={handleLogout}
            testID="settings-menu-item-로그아웃"
            style={styles.menuItem}
          >
            <Typography
              color={palette.theme.gray[60]}
              testID="settings-menu-text-로그아웃"
              variant="body2"
              weight="semibold"
            >
              로그아웃
            </Typography>
          </Pressable>
        </View>
        <View
          testID="settings-account-deletion"
          style={styles.accountDeletionSection}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/delete-account')}
            style={styles.accountDeletionButton}
          >
            <Typography
              color={palette.theme.gray[50]}
              testID="settings-account-deletion-text"
              variant="body3"
              weight="semibold"
            >
              회원 탈퇴
            </Typography>
          </Pressable>
        </View>
      </ScrollView>
    </Container>
  );
};

export default MyInfo;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.foundation.spacing[6],
  },
  profileSection: {
    paddingTop: theme.foundation.spacing[0],
    paddingHorizontal: theme.foundation.spacing[6],
    paddingBottom: 23,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: baseFoundation.dimension.x48,
    height: baseFoundation.dimension.x48,
    borderRadius: baseFoundation.dimension.x24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.brand.card,
  },
  character: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
  },
  profileText: {
    marginLeft: theme.foundation.spacing[3],
    gap: 7,
  },
  loginTypeBadge: {
    alignSelf: 'flex-start',
    height: baseFoundation.dimension.x20,
    paddingHorizontal: theme.foundation.spacing[2],
    borderRadius: baseFoundation.dimension.x99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelRow: {
    marginTop: theme.foundation.spacing[5],
    alignItems: 'flex-start',
  },
  levelBadge: {
    height: baseFoundation.dimension.x16,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x99,
    backgroundColor: theme.colors.brand.primary,
  },
  expLabelRow: {
    marginTop: theme.foundation.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.dimension.x5,
  },
  expValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.dimension.x2,
  },
  progressTrack: {
    marginTop: theme.foundation.spacing[2],
    height: baseFoundation.dimension.x8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  menuList: {
    paddingTop: theme.foundation.spacing[3],
  },
  menuItem: {
    height: baseFoundation.dimension.x44,
    justifyContent: 'center',
    paddingLeft: theme.foundation.spacing[6],
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountDeletionSection: {
    marginTop: 'auto',
    paddingTop: theme.foundation.spacing[8],
    paddingHorizontal: theme.foundation.spacing[6],
  },
  accountDeletionButton: {
    alignSelf: 'flex-start',
    minHeight: baseFoundation.dimension.x44,
    justifyContent: 'center',
  },
}));
