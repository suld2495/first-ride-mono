import { Image, Modal, Pressable, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';
import type { ThemeName } from '@/theme/themes';
import type { LevelProgressCelebration } from '@/utils/level-progress-celebration';

interface LevelProgressCelebrationModalProps {
  celebration: LevelProgressCelebration | null;
  characterImageUrl?: null | string;
  onClose: () => void;
  themeName: ThemeName;
}

const getThemePalette = (themeName: ThemeName) => {
  if (themeName === 'green') {
    return {
      accent: palette.theme.green[50],
      accentStrong: palette.theme.green[80],
      accentSoft: palette.theme.green[10],
      card: palette.theme.green[5],
      shadow: palette.theme.green[100],
    };
  }

  if (themeName === 'red') {
    return {
      accent: palette.theme.red[50],
      accentStrong: palette.theme.red[80],
      accentSoft: palette.theme.red[10],
      card: palette.theme.red[5],
      shadow: palette.theme.red[100],
    };
  }

  return {
    accent: palette.theme.blue[50],
    accentStrong: palette.theme.blue[80],
    accentSoft: palette.theme.blue[10],
    card: palette.theme.blue[5],
    shadow: palette.theme.blue[100],
  };
};

const getEvolutionStageLabel = (evolutionCount: number) => {
  if (evolutionCount >= 2) {
    return '3단계';
  }

  if (evolutionCount >= 1) {
    return '2단계';
  }

  return '1단계';
};

const PixelSpark = ({
  color,
  size,
  style,
}: {
  color: string;
  size: number;
  style: StyleProp<ViewStyle>;
}) => (
  <View
    style={[styles.spark, { backgroundColor: color, height: size, width: size }, style]}
  />
);

const LevelProgressCelebrationModal = ({
  celebration,
  characterImageUrl,
  onClose,
  themeName,
}: LevelProgressCelebrationModalProps) => {
  if (!celebration) {
    return null;
  }

  const isEvolution = celebration.type === 'evolution';
  const colors = getThemePalette(themeName);
  const characterAsset = getRoutineSceneRemoteAsset(characterImageUrl);
  const title = isEvolution ? '전직 성공!' : '레벨업!';
  const subtitle = isEvolution
    ? '레벨업해서 진화했어요!'
    : `Lv.${celebration.previousLevel}에서 Lv.${celebration.currentLevel}로 성장했어요.`;
  const description = isEvolution
    ? '꾸준히 쌓은 루틴 경험치로 캐릭터가 새로운 모습에 가까워졌어요.'
    : '오늘의 루틴이 경험치가 되어 캐릭터가 한 단계 더 단단해졌어요.';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible
      statusBarTranslucent
    >
      <View style={styles.root} testID="level-progress-celebration-overlay">
        <Pressable
          accessibilityLabel="축하 모달 닫기"
          onPress={onClose}
          style={styles.backdrop}
          testID="level-progress-celebration-backdrop"
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: isEvolution ? colors.card : palette.white,
              borderColor: colors.accentStrong,
            },
          ]}
          testID="level-progress-celebration-modal"
        >
          <View style={styles.pixelHeader}>
            <PixelSpark
              color={colors.accentSoft}
              size={10}
              style={styles.sparkLeft}
            />
            <PixelSpark
              color={colors.accent}
              size={8}
              style={styles.sparkTop}
            />
            <PixelSpark
              color={colors.accentStrong}
              size={6}
              style={styles.sparkRight}
            />
            <View
              style={[
                styles.characterFrame,
                {
                  backgroundColor: colors.accentSoft,
                  borderColor: isEvolution ? colors.accentStrong : colors.accent,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              {characterAsset ? (
                renderRoutineSceneAsset(characterAsset, {
                  testID: 'level-progress-celebration-character',
                  style: styles.character,
                })
              ) : (
                <Image
                  source={require('../../assets/routine/character.png')}
                  style={styles.character}
                  testID="level-progress-celebration-character-fallback"
                />
              )}
            </View>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: isEvolution
                  ? colors.accent
                  : colors.accentSoft,
              },
            ]}
            testID="level-progress-celebration-badge"
          >
            <Typography
              color={isEvolution ? palette.white : colors.accentStrong}
              variant="caption2"
              weight="bold"
            >
              {isEvolution
                ? `${getEvolutionStageLabel(
                    celebration.previousEvolutionCount,
                  )} > ${getEvolutionStageLabel(
                    celebration.currentEvolutionCount,
                  )}`
                : `Lv.${celebration.previousLevel} > Lv.${celebration.currentLevel}`}
            </Typography>
          </View>

          <Typography
            color={colors.accentStrong}
            style={styles.title}
            testID="level-progress-celebration-title"
            textAlign="center"
            variant="h2"
            weight="bold"
          >
            {title}
          </Typography>
          <Typography
            color={palette.theme.gray[80]}
            style={styles.subtitle}
            testID="level-progress-celebration-subtitle"
            textAlign="center"
            variant="body2"
            weight="bold"
          >
            {subtitle}
          </Typography>
          <Typography
            color={palette.theme.gray[50]}
            style={styles.description}
            textAlign="center"
            variant="caption1"
            weight="medium"
          >
            {description}
          </Typography>

          <Button
            accessibilityLabel="축하 모달 확인"
            backgroundColor={palette.theme.gray[95]}
            fullWidth
            onPress={onClose}
            size="lg"
            style={styles.button}
            textColor={palette.white}
          >
            확인
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default LevelProgressCelebrationModal;

const styles = StyleSheet.create(() => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: baseFoundation.spacing[6],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 3, 6, 0.5)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: baseFoundation.dimension.x2,
    borderRadius: baseFoundation.dimension.x16,
    paddingTop: baseFoundation.spacing[6],
    paddingHorizontal: baseFoundation.spacing[5],
    paddingBottom: baseFoundation.spacing[5],
  },
  pixelHeader: {
    width: baseFoundation.dimension.x140,
    height: baseFoundation.dimension.x140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterFrame: {
    width: baseFoundation.dimension.x112,
    height: baseFoundation.dimension.x112,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: baseFoundation.dimension.x2,
    borderRadius: baseFoundation.dimension.x8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 0,
    elevation: 4,
  },
  character: {
    width: baseFoundation.dimension.x120,
    height: baseFoundation.dimension.x120,
    transform: [{ translateY: -6 }],
  },
  spark: {
    position: 'absolute',
    borderRadius: baseFoundation.dimension.x1,
  },
  sparkLeft: {
    left: baseFoundation.dimension.x8,
    top: baseFoundation.dimension.x48,
  },
  sparkTop: {
    right: baseFoundation.dimension.x28,
    top: baseFoundation.dimension.x14,
  },
  sparkRight: {
    right: baseFoundation.dimension.x10,
    bottom: baseFoundation.dimension.x40,
  },
  badge: {
    minHeight: baseFoundation.dimension.x28,
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x4,
    paddingHorizontal: baseFoundation.spacing[3],
    marginTop: baseFoundation.spacing[2],
  },
  title: {
    marginTop: baseFoundation.spacing[3],
  },
  subtitle: {
    marginTop: baseFoundation.spacing[2],
    lineHeight: baseFoundation.dimension.x24,
  },
  description: {
    marginTop: baseFoundation.spacing[2],
    lineHeight: baseFoundation.dimension.x20,
  },
  button: {
    marginTop: baseFoundation.spacing[5],
  },
}));
