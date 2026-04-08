import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';

interface QuestRewardsProps {
  rewardName: string;
  rewardType?: string;
}

const QuestRewards = ({ rewardName }: QuestRewardsProps) => {
  const { theme } = useUnistyles();

  return (
    <ThemeView style={styles.container}>
      {/* Header */}
      <ThemeView style={styles.header} transparent>
        <Ionicons
          name="trophy-outline"
          size={20}
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
    padding: theme.foundation.spacing.m,
    borderRadius: theme.foundation.radii.m,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },

  headerText: {
    fontWeight: 'bold',
  },
}));
