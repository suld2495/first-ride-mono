import Ionicons from '@expo/vector-icons/Ionicons';
import { Fragment } from 'react';
import { View } from 'react-native';

import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import Card from '@/components/ui/card';
import Divider from '@/components/ui/divider';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

const GROWTH_STAGES = [
  {
    id: 'beginner',
    label: '초보자',
    levels: 'Lv.1~4',
    asset: getRoutineSceneRemoteAsset(
      '/assets/characters/warrior_female_beginner.png',
    ),
  },
  {
    id: 'intermediate',
    label: '1차 성장',
    levels: 'Lv.5~9',
    asset: getRoutineSceneRemoteAsset(
      '/assets/characters/warrior_female_intermediate.png',
    ),
  },
  {
    id: 'advanced',
    label: '2차 성장',
    levels: 'Lv.10+',
    asset: getRoutineSceneRemoteAsset(
      '/assets/characters/warrior_female_advanced.png',
    ),
  },
] as const;

const EXPERIENCE_REWARDS = [
  { id: 'quest', label: '퀘스트 달성', experience: 5 },
  { id: 'mate', label: '메이트 루틴\n1회 인증', experience: 3 },
  { id: 'self', label: '셀프 루틴\n1회 인증', experience: 1 },
] as const;

const GrowthPage = () => {
  const { theme } = useAppTheme();

  return (
    <View style={styles.body}>
      <View style={styles.growthScene}>
        {GROWTH_STAGES.map((stage) => (
          <Fragment key={stage.id}>
            {stage.id !== 'beginner' ? (
              <Ionicons
                accessible={false}
                name="chevron-forward"
                color={theme.colors.brand.icon}
                size={baseFoundation.iconSize.s}
                style={styles.growthArrow}
              />
            ) : null}
            <View
              accessible
              accessibilityLabel={`${stage.label}, ${stage.levels}`}
              style={styles.stage}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.characterSlot}
              >
                {stage.asset
                  ? renderRoutineSceneAsset(stage.asset, {
                      style: styles.character,
                    })
                  : null}
              </View>
              <View style={styles.stageLabel}>
                <Typography
                  variant="body3"
                  weight="bold"
                  color={theme.colors.text.gray}
                  textAlign="center"
                >
                  {stage.label}
                </Typography>
                <Typography
                  variant="caption2"
                  weight="semibold"
                  style={styles.levelText}
                  textAlign="center"
                >
                  {stage.levels}
                </Typography>
              </View>
            </View>
          </Fragment>
        ))}
      </View>

      <Card style={styles.experiencePanel}>
        <View style={styles.rewards}>
          {EXPERIENCE_REWARDS.map((reward) => (
            <View
              accessible
              accessibilityLabel={`${reward.label.replace('\n', ' ')}, ${reward.experience} XP`}
              key={reward.id}
              style={styles.reward}
            >
              <Typography
                variant="subtitle1"
                weight="bold"
                style={styles.experience}
                textAlign="center"
              >
                +{reward.experience} XP
              </Typography>
              <Typography
                variant="caption1"
                weight="medium"
                style={styles.text}
                textAlign="center"
              >
                {reward.label}
              </Typography>
            </View>
          ))}
        </View>
        <Divider />
        <View style={styles.dailyLimit}>
          <Ionicons
            accessible={false}
            color={theme.colors.feedback.info.text}
            name="sparkles-outline"
            size={baseFoundation.iconSize.m}
          />
          <View style={styles.dailyLimitText}>
            <Typography variant="body3" weight="bold" style={styles.text}>
              하루 최대 15 XP까지 쌓을 수 있어요
            </Typography>
            <Typography variant="caption1" style={styles.note}>
              퀘스트 경험치는 일일 한도에서 제외돼요.
            </Typography>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default GrowthPage;

const styles = StyleSheet.create((theme) => ({
  body: {
    gap: baseFoundation.spacing[5],
  },
  growthScene: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseFoundation.spacing[1],
    paddingHorizontal: baseFoundation.spacing[3],
    paddingVertical: baseFoundation.spacing[3],
  },
  stage: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: baseFoundation.spacing[3],
  },
  characterSlot: {
    height: baseFoundation.dimension.x120,
    width: '100%',
    justifyContent: 'flex-end',
  },
  character: {
    height: '100%',
    width: '100%',
  },
  growthArrow: {
    marginTop: baseFoundation.spacing[12],
  },
  stageLabel: {
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
  },
  text: {
    color: theme.colors.text.primary,
  },
  levelText: {
    color: theme.colors.text.label,
  },
  experiencePanel: {
    gap: baseFoundation.spacing[4],
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: baseFoundation.spacing[2],
  },
  reward: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
  },
  experience: {
    color: theme.colors.feedback.info.text,
  },
  dailyLimit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[2],
  },
  dailyLimitText: {
    flex: 1,
    minWidth: 0,
    gap: baseFoundation.spacing[1],
  },
  note: {
    color: theme.colors.text.secondary,
  },
}));
