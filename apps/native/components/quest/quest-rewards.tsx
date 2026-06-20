import Ionicons from '@expo/vector-icons/Ionicons';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface QuestRewardsProps {
  rewardName: string;
  rewardType?: string;
}

const QuestRewards = ({ rewardName }: QuestRewardsProps) => {
  const { theme } = useAppTheme();

  return (
    <ThemeView style={styles.container}>
      {/* Header */}
      <ThemeView style={styles.header} transparent>
        <Ionicons
          name="trophy-outline"
          size={baseFoundation.iconSize.m}
          color={theme.colors.action.primary.default}
        />
        <Typography variant="body" style={styles.headerText}>
          REWARDS
        </Typography>
      </ThemeView>

      {/* Reward Name */}
      <Typography variant="body">{rewardName}</Typography>
    </ThemeView>
  );
};

export default QuestRewards;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background.surface,
    padding: theme.foundation.spacing[4],
    borderRadius: theme.foundation.radii.m,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseFoundation.spacing[1],
    marginBottom: baseFoundation.dimension.x12,
  },

  headerText: {
    fontWeight: 'bold',
  },
}));
