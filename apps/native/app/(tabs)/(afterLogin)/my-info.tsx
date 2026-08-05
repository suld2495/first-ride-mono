import Ionicons from '@expo/vector-icons/Ionicons';
import { useMyStatsQuery } from '@repo/shared/hooks/useStat';
import { useFetchMeQuery } from '@repo/shared/hooks/useUser';
import type { Gender } from '@repo/types';
import { router, useFocusEffect } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';

import LoginTypeBadge from '@/components/auth/login-type-badge';
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
import { fontFamilies } from '@/theme/font-families';
import { baseFoundation, palette } from '@/theme/tokens';

const FALLBACK_LEVEL = 1;
const FALLBACK_EXP = 0;
const FALLBACK_NEXT_LEVEL_EXP = 10;
const SETTINGS_LEVEL_TEXT_SIZE = baseFoundation.typography.size.h3 - 6;
const CHARACTER_EVOLUTION_EXP_PER_LEVEL = 10;

const SETTING_ITEMS: Array<{
  title: string;
  href?: Href;
}> = [
  { title: '한마디', href: '/modal?type=account' },
  { title: '루틴 설정', href: '/routine-settings' },
  { title: '알림 설정', href: '/notification-settings' },
  { title: '약관', href: '/terms' },
  { title: '이루라 길드', href: '/hall-of-heroes' },
];

type ThemeTone = 'blue' | 'green' | 'red';
type EvolutionGender = Lowercase<Gender>;
type EvolutionUserSource = {
  characterCode?: null | string;
  characterImageUrl?: null | string;
  gender?: Gender;
};

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

const getEvolutionJobType = (themeTone: ThemeTone) => {
  switch (themeTone) {
    case 'green':
      return 'archer';
    case 'red':
      return 'mage';
    default:
      return 'warrior';
  }
};

const getEvolutionGender = (
  userSource: EvolutionUserSource | null | undefined,
): EvolutionGender => {
  if (userSource?.gender === 'MALE') {
    return 'male';
  }

  if (userSource?.gender === 'FEMALE') {
    return 'female';
  }

  const sourceText =
    `${userSource?.characterCode ?? ''} ${userSource?.characterImageUrl ?? ''}`
      .toLowerCase()
      .trim();

  if (/(^|[_/\-.])male([_/\-.]|$)/.test(sourceText)) {
    return 'male';
  }

  return 'female';
};

const getCharacterEvolutionStages = (
  themeTone: ThemeTone,
  gender: EvolutionGender,
) => {
  const jobType = getEvolutionJobType(themeTone);

  return [
    {
      label: '초보자',
      levelRange: 'Lv.1~4',
      imageUrl: `/assets/characters/evolution/${jobType}_${gender}_beginner.png`,
      isLocked: false,
    },
    {
      label: '1차 전직',
      levelRange: 'Lv.5~9',
      imageUrl: `/assets/characters/evolution/${jobType}_${gender}_intermediate.png`,
      isLocked: true,
    },
    {
      label: '2차 전직',
      levelRange: 'Lv.10+',
      imageUrl: `/assets/characters/evolution/${jobType}_${gender}_advanced.png`,
      isLocked: true,
    },
  ] as const;
};

const MyInfo = () => {
  const [isEvolutionModalVisible, setIsEvolutionModalVisible] = useState(false);
  const signOut = useAuthSignOut();
  const user = useAuthUser();
  const { data: currentUser } = useFetchMeQuery(user?.userId);
  const { pushToken } = useNotifications();
  const { data: stats, refetch: refetchMyStats } = useMyStatsQuery(
    user?.userId ?? '',
  );
  const { theme } = useAppTheme();
  const currentExp = stats?.currentLevelProgress ?? FALLBACK_EXP;
  const nextLevelExp = stats?.expForNextLevel ?? FALLBACK_NEXT_LEVEL_EXP;
  const expProgress =
    nextLevelExp > 0 ? Math.min(currentExp / nextLevelExp, 1) : 0;
  const themeTone = getThemeTone(theme.name);
  const { themeColor, softThemeColor } = getThemePalette(themeTone);
  const evolutionGender = getEvolutionGender(currentUser);
  const evolutionStages = useMemo(
    () => getCharacterEvolutionStages(themeTone, evolutionGender),
    [evolutionGender, themeTone],
  );
  const characterAsset = getRoutineSceneRemoteAsset(
    currentUser?.characterImageUrl,
  );
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
          await signOut(pushToken?.data);
        },
      },
    ]);
  };

  const closeEvolutionModal = () => {
    setIsEvolutionModalVisible(false);
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
                style={styles.profileName}
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
              ) : (
                <LoginTypeBadge
                  loginType={currentUser?.loginType}
                  testID="settings-profile-login-type-badge"
                  textTestID="settings-profile-login-type-text"
                />
              )}
            </View>
          </View>

          <View testID="settings-level-row" style={styles.levelRow}>
            <View testID="settings-exp-row" style={styles.expLabelRow}>
              <View testID="settings-exp-value-row" style={styles.expValueRow}>
                <Typography
                  color={themeColor[80]}
                  style={styles.expSummaryText}
                  testID="settings-exp-label"
                  variant="body3"
                  weight="semibold"
                >
                  경험치
                </Typography>
                <Typography
                  color={softThemeColor[60]}
                  style={styles.expSummaryText}
                  testID="settings-exp-unit"
                  variant="caption2"
                  weight="semibold"
                >
                  EXP
                </Typography>
                <View
                  testID="settings-exp-number-row"
                  style={styles.expNumberRow}
                >
                  <Typography
                    color={softThemeColor[60]}
                    style={styles.expSummaryText}
                    testID="settings-exp-current"
                    variant="caption2"
                    weight="semibold"
                  >
                    {currentExp}
                  </Typography>
                  <Typography
                    color={softThemeColor[60]}
                    style={styles.expSummaryText}
                    variant="caption2"
                    weight="semibold"
                  >
                    /
                  </Typography>
                  <Typography
                    color={softThemeColor[60]}
                    style={styles.expSummaryText}
                    testID="settings-exp-next"
                    variant="caption2"
                    weight="semibold"
                  >
                    {nextLevelExp}
                  </Typography>
                </View>
                <Pressable
                  accessibilityLabel="캐릭터 진화 안내"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setIsEvolutionModalVisible(true)}
                  style={[
                    styles.expInfoButton,
                    { borderColor: themeColor[80] },
                  ]}
                  testID="settings-exp-info-button"
                >
                  <Typography
                    color={themeColor[80]}
                    style={styles.expInfoText}
                    testID="settings-exp-info-icon"
                    variant="caption2"
                    weight="bold"
                  >
                    ?
                  </Typography>
                </Pressable>
              </View>
            </View>

            <View testID="settings-level-badge" style={styles.levelBadge}>
              <Typography
                color={themeColor[80]}
                style={styles.levelText}
                testID="settings-level-text"
                variant="h3"
                weight="bold"
              >
                Lv. {stats?.currentLevel ?? FALLBACK_LEVEL}
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
                  weight="regular"
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
              weight="regular"
            >
              로그아웃
            </Typography>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/beta-feedback')}
            testID="settings-menu-item-베타 피드백"
            style={styles.menuItem}
          >
            <Typography
              color={palette.theme.red[50]}
              testID="settings-menu-text-베타 피드백"
              variant="body2"
              weight="regular"
            >
              베타 피드백
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
              color={palette.theme.gray[30]}
              testID="settings-account-deletion-text"
              variant="body3"
              weight="regular"
            >
              회원 탈퇴
            </Typography>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={closeEvolutionModal}
        transparent
        visible={isEvolutionModalVisible}
      >
        <View style={styles.evolutionModalRoot}>
          <Pressable
            accessibilityLabel="캐릭터 진화 안내 닫기"
            onPress={closeEvolutionModal}
            style={styles.evolutionModalBackdrop}
            testID="settings-evolution-modal-backdrop"
          />
          <View
            accessibilityViewIsModal
            style={styles.evolutionModalCard}
            testID="settings-evolution-modal"
          >
            <View style={styles.evolutionModalHeader}>
              <Typography
                color={palette.theme.gray[80]}
                testID="settings-evolution-modal-title"
                variant="subtitle2"
                weight="bold"
              >
                캐릭터 진화
              </Typography>
              <Pressable
                accessibilityLabel="닫기"
                accessibilityRole="button"
                hitSlop={baseFoundation.spacing[2]}
                onPress={closeEvolutionModal}
                style={styles.evolutionCloseButton}
                testID="settings-evolution-modal-close"
              >
                <Ionicons
                  color={palette.theme.gray[70]}
                  name="close-outline"
                  size={baseFoundation.iconSize.l}
                />
              </Pressable>
            </View>
            <Typography
              color={palette.theme.gray[60]}
              style={styles.evolutionDescription}
              testID="settings-evolution-modal-description"
              variant="caption1"
              weight="medium"
            >
              레벨에 따라 캐릭터 모습이 바뀌어요. (베타기간에는{' '}
              {CHARACTER_EVOLUTION_EXP_PER_LEVEL}EXP 마다 1레벨이 올라요)
            </Typography>

            <View style={styles.evolutionStageRow}>
              {evolutionStages.map((stage) => {
                const stageAsset = getRoutineSceneRemoteAsset(stage.imageUrl);

                return (
                  <View
                    key={stage.label}
                    style={[
                      styles.evolutionStageCard,
                      { backgroundColor: theme.colors.brand.card },
                    ]}
                    testID={`settings-evolution-stage-${stage.label}`}
                  >
                    <View
                      style={styles.evolutionCharacterSlot}
                      testID={`settings-evolution-character-slot-${stage.label}`}
                    >
                      {stageAsset
                        ? renderRoutineSceneAsset(stageAsset, {
                            testID: `settings-evolution-character-${stage.label}`,
                            style: styles.evolutionCharacter,
                          })
                        : null}
                      {stage.isLocked ? (
                        <Typography
                          color={palette.white}
                          style={styles.evolutionLockedQuestion}
                          testID={`settings-evolution-character-question-${stage.label}`}
                          variant="h3"
                          weight="bold"
                        >
                          ?
                        </Typography>
                      ) : null}
                    </View>
                    <Typography
                      color={themeColor[80]}
                      style={styles.evolutionStageLevel}
                      variant="caption2"
                      weight="bold"
                    >
                      {stage.levelRange}
                    </Typography>
                    <Typography
                      color={palette.theme.gray[70]}
                      variant="caption2"
                      weight="semibold"
                    >
                      {stage.label}
                    </Typography>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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
    width: baseFoundation.dimension.x60,
    height: baseFoundation.dimension.x60,
    borderRadius: baseFoundation.dimension.x12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.brand.card,
  },
  character: {
    width: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x56,
    transform: [{ translateY: -6 }],
  },
  profileName: {
    fontSize: baseFoundation.typography.size.body2 + 2,
  },
  profileText: {
    marginLeft: theme.foundation.spacing[3],
    gap: 7,
  },
  levelRow: {
    marginTop: theme.foundation.spacing[5],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.foundation.spacing[3],
  },
  levelBadge: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  levelText: {
    fontFamily: fontFamilies.poppinsBold,
    fontSize: SETTINGS_LEVEL_TEXT_SIZE,
    textAlign: 'right',
  },
  expSummaryText: {
    fontSize: baseFoundation.typography.size.caption1,
  },
  expLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  expValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: baseFoundation.dimension.x8,
  },
  expNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: baseFoundation.dimension.x2,
  },
  expInfoButton: {
    width: baseFoundation.dimension.x14,
    height: baseFoundation.dimension.x14,
    borderRadius: baseFoundation.dimension.x7,
    borderWidth: baseFoundation.dimension.x1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expInfoText: {
    fontSize: baseFoundation.typography.size.caption2 - 1,
    lineHeight: baseFoundation.dimension.x12,
    includeFontPadding: false,
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
  evolutionModalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[6],
  },
  evolutionModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 3, 6, 0.48)',
  },
  evolutionModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: baseFoundation.dimension.x16,
    backgroundColor: palette.white,
    padding: baseFoundation.spacing[5],
  },
  evolutionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evolutionCloseButton: {
    width: baseFoundation.dimension.x36,
    height: baseFoundation.dimension.x36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evolutionDescription: {
    marginTop: baseFoundation.spacing[2],
    lineHeight: baseFoundation.dimension.x18,
  },
  evolutionStageRow: {
    marginTop: baseFoundation.spacing[4],
    flexDirection: 'row',
    gap: baseFoundation.spacing[2],
  },
  evolutionStageCard: {
    flex: 1,
    minHeight: baseFoundation.dimension.x112,
    borderRadius: baseFoundation.dimension.x12,
    alignItems: 'center',
    paddingHorizontal: baseFoundation.spacing[1],
    paddingTop: baseFoundation.spacing[2],
    paddingBottom: baseFoundation.spacing[2],
  },
  evolutionCharacterSlot: {
    width: baseFoundation.dimension.x60,
    height: baseFoundation.dimension.x60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evolutionCharacter: {
    width: baseFoundation.dimension.x56,
    height: baseFoundation.dimension.x56,
  },
  evolutionLockedQuestion: {
    position: 'absolute',
    width: baseFoundation.dimension.x28,
    height: baseFoundation.dimension.x28,
    fontFamily: fontFamilies.poppinsBold,
    fontSize: baseFoundation.typography.size.h3 - 4,
    lineHeight: baseFoundation.dimension.x28,
    includeFontPadding: false,
    textAlign: 'center',
    transform: [
      { translateX: baseFoundation.dimension.x6 },
      { translateY: baseFoundation.dimension.x6 },
    ],
  },
  evolutionStageLevel: {
    marginTop: baseFoundation.spacing[1],
  },
}));
