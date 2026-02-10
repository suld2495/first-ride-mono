import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface QuestRewardsProps {
  rewardName: string;
  rewardType?: string;
}

const QuestRewards = ({ rewardName }: QuestRewardsProps) => {
  const { theme } = useUnistyles();

  return (
    <ThemeView style={styles.container}>
      {/* Header */}
      <ThemeView style={styles.header}>
        <Ionicons name="trophy-outline" size={20} color={theme.colors.feedback.warning.text} />
        <Typography variant="body" style={styles.headerText}>
          REWARDS
        </Typography>
      </ThemeView>

      {/* Reward Name */}
      <Typography variant="body">
        {rewardName}
      </Typography>
    </ThemeView>
  );
};

export default QuestRewards;

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.feedback.warning.bg,
    borderColor: theme.colors.feedback.warning.border,
    borderWidth: 1,
    padding: 8,
    paddingBottom: 12,
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
