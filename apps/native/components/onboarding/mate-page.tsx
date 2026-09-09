import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import {
  getRoutineSceneRemoteAsset,
  renderRoutineSceneAsset,
} from '@/components/routine/routine-scene-art';
import Card from '@/components/ui/card';
import Divider from '@/components/ui/divider';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import Typography from '@/components/ui/typography';

const MATES = [
  {
    label: '나',
    image: '/assets/characters/evolution/warrior_female_beginner.png',
  },
  {
    label: '메이트',
    image: '/assets/characters/evolution/archer_male_beginner.png',
  },
] as const;

export default function MatePage() {
  const { theme } = useAppTheme();

  return (
    <View style={styles.body}>
      <View style={styles.scene}>
        <Card padding="sm" radius="l" style={styles.speech}>
          <Ionicons
            name="heart"
            size={theme.foundation.iconSize.s}
            color={theme.colors.feedback.success.text}
          />
          <Typography
            variant="body3"
            weight="semibold"
            color={theme.colors.feedback.success.text}
          >
            오늘도 같이 해보자!
          </Typography>
        </Card>
        <View style={styles.mates}>
          {MATES.map((mate) => {
            const asset = getRoutineSceneRemoteAsset(mate.image);
            return (
              <View key={mate.label} style={styles.mate}>
                {asset
                  ? renderRoutineSceneAsset(asset, { style: styles.character })
                  : null}
                <Typography
                  variant="caption1"
                  weight="semibold"
                  color={theme.colors.text.label}
                >
                  {mate.label}
                </Typography>
              </View>
            );
          })}
        </View>
        <View style={styles.promise}>
          <Ionicons
            name="checkmark-circle"
            size={theme.foundation.iconSize.m}
            color={theme.colors.brand.icon}
          />
          <Typography
            variant="caption1"
            weight="medium"
            color={theme.colors.text.label}
          >
            함께 지키는 약속, 함께 쌓이는 하루
          </Typography>
        </View>
      </View>
      <Typography
        variant="body3"
        color={theme.colors.text.label}
        textAlign="center"
      >
        {'친구 탭에서 친구를 추가하고,\n루틴을 인증해줄 메이트로 지정해보세요.'}
      </Typography>
      <Divider />
      <View style={styles.penaltyText}>
        <Typography
          variant="body3"
          weight="semibold"
          color={theme.colors.text.gray}
          textAlign="center"
        >
          벌금으로 약속을 더 단단하게
        </Typography>
        <Typography
          variant="caption1"
          color={theme.colors.text.label}
          textAlign="center"
        >
          {
            '함께 정한 벌금으로 목표 달성에 도전해보세요.\n벌금 설정은 선택이에요.'
          }
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  body: { gap: theme.foundation.spacing[6] },
  scene: {
    alignItems: 'center',
    gap: theme.foundation.spacing[4],
  },
  speech: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  mates: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.foundation.spacing[8],
  },
  mate: { alignItems: 'center', gap: theme.foundation.spacing[1] },
  character: {
    width: theme.foundation.dimension.x120,
    height: theme.foundation.dimension.x140,
  },
  promise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.foundation.spacing[2],
  },
  penaltyText: { gap: theme.foundation.spacing[2] },
}));
