import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface QuestRewardsProps {
  rewardName: string;
  rewardType?: string;
}

const QuestRewards = ({ rewardName }: QuestRewardsProps) => {
  return (
    <ThemeView style={styles.container}>
      {/* Header */}
      <ThemeView style={styles.header}>
        <Ionicons name="trophy-outline" size={20} color="#fbbf24" />
        <Typography variant="body" style={styles.headerText}>
          REWARDS
        </Typography>
      </ThemeView>

      {/* Reward Name */}
      <Typography variant="body" style={{ color: '#e0f2fe' }}>
        {rewardName}
      </Typography>
    </ThemeView>
  );
};

export default QuestRewards;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: '#f59e0b',
    borderWidth: 1,
    padding: 8,
    paddingBottom: 12,
    borderRadius: 8,
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
});
