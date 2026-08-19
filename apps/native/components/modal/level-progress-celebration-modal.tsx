import { Image, Modal, Pressable, View } from 'react-native';

import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import { Button } from '@/components/ui/button';
import { StyleSheet } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { baseFoundation, palette } from '@/theme/tokens';
import type { LevelProgressCelebration } from '@/utils/level-progress-celebration';

interface LevelProgressCelebrationModalProps {
  celebration: LevelProgressCelebration | null;
  characterImageUrl?: null | string;
  onClose: () => void;
}

const getEvolutionStageLabel = (evolutionCount: number) => {
  if (evolutionCount >= 2) {
    return '3단계';
  }

  if (evolutionCount >= 1) {
    return '2단계';
  }

  return '1단계';
};

const LevelProgressCelebrationModal = ({
  celebration,
  characterImageUrl,
  onClose,
}: LevelProgressCelebrationModalProps) => {
  if (!celebration) {
    return null;
  }

  const isEvolution = celebration.type === 'evolution';
  const characterAsset = getRoutineSceneRemoteAsset(characterImageUrl);
  const title = isEvolution ? '전직 성공!' : '레벨업!';
  const subtitle = isEvolution
    ? '레벨업해서 성장했어요!'
    : `Lv.${celebration.previousLevel}에서 Lv.${celebration.currentLevel}로 성장했어요.`;
  const description = isEvolution
    ? '꾸준히 쌓은 루틴 경험치로 캐릭터가 새로운 모습으로 성장했어요.'
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
          style={styles.card}
          testID="level-progress-celebration-modal"
        >
          <View style={styles.characterSlot}>
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

          <View style={styles.badge} testID="level-progress-celebration-badge">
            <Typography
              color={palette.theme.gray[70]}
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
            color={palette.theme.gray[80]}
            style={styles.title}
            testID="level-progress-celebration-title"
            textAlign="center"
            variant="h2"
            weight="bold"
          >
            {title}
          </Typography>
          <Typography
            color={palette.theme.gray[70]}
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
            size="md"
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

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.foundation.spacing[6],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 3, 6, 0.48)',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderRadius: baseFoundation.dimension.x16,
    padding: theme.foundation.spacing[5],
    backgroundColor: palette.white,
  },
  characterSlot: {
    width: baseFoundation.dimension.x112,
    height: baseFoundation.dimension.x112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  character: {
    width: baseFoundation.dimension.x112,
    height: baseFoundation.dimension.x112,
  },
  badge: {
    minHeight: baseFoundation.dimension.x28,
    justifyContent: 'center',
    borderRadius: baseFoundation.dimension.x4,
    paddingHorizontal: theme.foundation.spacing[3],
    marginTop: theme.foundation.spacing[2],
    backgroundColor: palette.theme.gray[5],
  },
  title: {
    marginTop: theme.foundation.spacing[3],
  },
  subtitle: {
    marginTop: theme.foundation.spacing[2],
    lineHeight: baseFoundation.dimension.x24,
  },
  description: {
    marginTop: theme.foundation.spacing[2],
    lineHeight: baseFoundation.dimension.x20,
  },
  button: {
    marginTop: theme.foundation.spacing[5],
    borderRadius: baseFoundation.dimension.x8,
  },
}));
