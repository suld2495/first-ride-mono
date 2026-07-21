import { StatusBar } from 'expo-status-bar';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ArcherRoutineCharacterIcon,
  MageRoutineCharacterIcon,
  type RoutineCharacterIconProps,
  WarriorRoutineCharacterIcon,
} from '@/components/icons/routine-character-icons';
import PageHeader from '@/components/layout/page-header';
import Button from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { SHOW_SCROLL_INDICATOR } from '@/constants/SCROLL_INDICATOR';
import { baseFoundation, palette } from '@/theme/tokens';

type HeroTone = 'blue' | 'green' | 'red';

interface HallHero {
  id: string;
  className: string;
  description: string;
  tone: HeroTone;
  Character: ComponentType<RoutineCharacterIconProps>;
}

const HEROES: HallHero[] = [
  {
    id: 'warrior',
    className: '전사',
    description:
      '전사는 목표를 정하고 꾸준히 실천하는 사람에게 어울리는 캐릭터예요. 루틴을 반복해 꾸준함이 쌓일수록 더 강한 모습으로 성장해요.',
    tone: 'blue',
    Character: WarriorRoutineCharacterIcon,
  },
  {
    id: 'mage',
    className: '마법사',
    description:
      '마법사는 꾸준한 노력이 특별한 힘을 만든다고 믿는 캐릭터예요. 루틴을 반복할수록 마력이 쌓이고, 더 강력한 마법을 펼칠 수 있는 모습으로 성장해요.',
    tone: 'red',
    Character: MageRoutineCharacterIcon,
  },
  {
    id: 'archer',
    className: '궁수',
    description:
      '궁수는 한 걸음씩 목표를 향해 나아가는 사람에게 어울리는 캐릭터예요. 루틴을 반복할수록 집중력과 실력이 쌓여, 더욱 정확한 한 발을 쏘는 궁수로 성장해요.',
    tone: 'green',
    Character: ArcherRoutineCharacterIcon,
  },
];

const HERO_TONES = {
  blue: {
    page: palette.theme.blue[10],
    card: palette.theme.blue[5],
    dot: palette.theme.blue[50],
  },
  red: {
    page: palette.theme.red[10],
    card: palette.theme.red[5],
    dot: palette.theme.red[50],
  },
  green: {
    page: palette.theme.green[10],
    card: palette.theme.green[5],
    dot: palette.theme.green[50],
  },
} as const;

const BACKGROUND_TRANSITION_CONFIG = { duration: 300 } as const;
const WOODEN_ALE_ICON_SOURCE =
  require('@/assets/hall-of-heroes/ale-wooden-stein.png') as ImageSourcePropType;
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

const getNextHeroIndex = (index: number, direction: -1 | 1) =>
  (index + direction + HEROES.length) % HEROES.length;

export default function HallOfHeroesPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedHero = HEROES[selectedIndex];
  const colors = HERO_TONES[selectedHero.tone];
  const SelectedCharacter = selectedHero.Character;
  const pageBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: withTiming(colors.page, BACKGROUND_TRANSITION_CONFIG),
    }),
    [colors.page],
  );
  const cardBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: withTiming(colors.card, BACKGROUND_TRANSITION_CONFIG),
    }),
    [colors.card],
  );

  const selectRelativeHero = (direction: -1 | 1) => {
    setSelectedIndex((currentIndex) =>
      getNextHeroIndex(currentIndex, direction),
    );
  };

  return (
    <AnimatedSafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[styles.safeArea, pageBackgroundStyle]}
      testID="hall-of-heroes-screen"
    >
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <PageHeader title="영웅의 전당" showBackButton />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          style={styles.scrollView}
          testID="hall-of-heroes-scroll-view"
        >
          <View style={styles.heroStage}>
            <Animated.View
              testID="hall-of-heroes-card"
              style={[styles.heroCard, cardBackgroundStyle]}
            >
              <View style={styles.characterArea}>
                <SelectedCharacter
                  height={baseFoundation.dimension.x140}
                  testID="hall-of-heroes-character"
                  width={baseFoundation.dimension.x140}
                />
              </View>

              <Typography
                color={palette.theme.gray[90]}
                variant="h3"
                weight="semibold"
                style={styles.className}
              >
                {selectedHero.className}
              </Typography>
              <Typography
                color={palette.theme.gray[15]}
                variant="body1"
                style={styles.description}
              >
                {selectedHero.description}
              </Typography>
            </Animated.View>

            <Pressable
              accessibilityLabel="이전 영웅"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => selectRelativeHero(-1)}
              style={[styles.arrowButton, styles.previousArrow]}
            >
              <Typography
                color={palette.theme.gray[15]}
                variant="h1"
                weight="medium"
                style={styles.arrow}
              >
                ‹
              </Typography>
            </Pressable>
            <Pressable
              accessibilityLabel="다음 영웅"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => selectRelativeHero(1)}
              style={[styles.arrowButton, styles.nextArrow]}
            >
              <Typography
                color={palette.theme.gray[15]}
                variant="h1"
                weight="medium"
                style={styles.arrow}
              >
                ›
              </Typography>
            </Pressable>
          </View>

          <View accessibilityRole="tablist" style={styles.pagination}>
            {HEROES.map((hero, index) => {
              const isSelected = index === selectedIndex;

              return (
                <Pressable
                  key={hero.id}
                  accessibilityLabel={`${index + 1}번째 영웅`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  hitSlop={8}
                  onPress={() => setSelectedIndex(index)}
                  testID={`hall-of-heroes-dot-${index}`}
                  style={[
                    styles.paginationDot,
                    {
                      backgroundColor: isSelected
                        ? colors.dot
                        : palette.theme.gray[15],
                      opacity: isSelected ? 1 : 0.35,
                    },
                  ]}
                />
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.supportAction}>
          <Button
            accessibilityLabel="영웅들에게 에일 한 잔 대접하기"
            accessibilityRole="button"
            backgroundColor={palette.theme.gray[90]}
            fullWidth
            leftIcon={
              <View
                style={styles.supportIconBadge}
                testID="hall-of-heroes-wooden-ale-icon-badge"
              >
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="contain"
                  source={WOODEN_ALE_ICON_SOURCE}
                  style={styles.supportIcon}
                  testID="hall-of-heroes-wooden-ale-icon"
                />
              </View>
            }
            size="lg"
            style={styles.supportButton}
            testID="hall-of-heroes-support-button"
            textColor={palette.white}
            title="영웅들에게 에일 한 잔 대접하기"
          />
        </View>
      </View>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: theme.foundation.spacing[6],
    paddingBottom: theme.foundation.spacing[6],
  },
  heroStage: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  heroCard: {
    alignItems: 'center',
    width: '72%',
    maxWidth: baseFoundation.dimension.x320,
    minHeight: 500,
    paddingTop: theme.foundation.spacing[12],
    paddingHorizontal: theme.foundation.spacing[5],
    paddingBottom: theme.foundation.spacing[8],
    borderRadius: theme.foundation.radii.xl,
  },
  characterArea: {
    width: baseFoundation.dimension.x180,
    height: baseFoundation.dimension.x180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  className: {
    marginTop: theme.foundation.spacing[2],
    textAlign: 'center',
  },
  description: {
    maxWidth: 270,
    marginTop: theme.foundation.spacing[3],
    textAlign: 'center',
    lineHeight: 25,
  },
  arrowButton: {
    position: 'absolute',
    top: 272,
    width: baseFoundation.dimension.x32,
    height: baseFoundation.dimension.x56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousArrow: {
    left: theme.foundation.spacing[1],
  },
  nextArrow: {
    right: theme.foundation.spacing[1],
  },
  arrow: {
    lineHeight: baseFoundation.dimension.x40,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.foundation.spacing[2],
    marginTop: theme.foundation.spacing[6],
  },
  paginationDot: {
    width: baseFoundation.dimension.x8,
    height: baseFoundation.dimension.x8,
    borderRadius: baseFoundation.dimension.x4,
  },
  supportAction: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingTop: theme.foundation.spacing[3],
    paddingHorizontal: theme.foundation.spacing[6],
  },
  supportButton: {
    shadowColor: palette.theme.gray[90],
  },
  supportIconBadge: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x20,
    backgroundColor: palette.yellow[100],
  },
  supportIcon: {
    width: baseFoundation.iconSize.xl,
    height: baseFoundation.iconSize.xl,
  },
}));
