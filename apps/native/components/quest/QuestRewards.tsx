import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeText from '../common/ThemeText';

interface QuestRewardsProps {
  rewardName: string;
  rewardType?: string;
}

const QuestRewards = ({ rewardName }: QuestRewardsProps) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="trophy-outline" size={20} color="#fbbf24" />
        <ThemeText
          variant="default"
          lightColor="#fbbf24"
          darkColor="#fbbf24"
          style={styles.headerText}
        >
          REWARDS
        </ThemeText>
      </View>

      {/* Reward Name */}
      <ThemeText variant="default" lightColor="#e0f2fe" darkColor="#e0f2fe">
        {rewardName}
      </ThemeText>
    </View>
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
