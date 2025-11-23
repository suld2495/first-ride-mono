import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface QuestBoxProps {
  title: string;
  value: string | number;
  color: string;
}

const QuestBox = ({ title, value, color }: QuestBoxProps) => {
  return (
    <ThemeView style={styles.box}>
      <Typography variant="caption" style={styles.boxTitle}>
        {title}
      </Typography>
      <Typography variant="title" style={[styles.boxValue, { color }]}>
        {value}
      </Typography>
    </ThemeView>
  );
};

interface QuestInfoProps {
  requiredLevel: number;
  currentParticipants: number;
  maxParticipants: number;
}

const QuestInfo = ({
  requiredLevel,
  currentParticipants,
  maxParticipants,
}: QuestInfoProps) => {
  const progress = (currentParticipants / maxParticipants) * 100;
  const isFull = currentParticipants === maxParticipants;

  return (
    <ThemeView style={styles.container}>
      {/* Header */}
      <ThemeView style={styles.header}>
        <Ionicons name="flash-outline" size={20} color="#1ddeff" />
        <Typography variant="body" style={styles.headerText}>
          QUEST INFO
        </Typography>
      </ThemeView>

      {/* Info Boxes */}
      <ThemeView style={styles.boxesContainer}>
        <QuestBox
          title="최소 레벨"
          value={`LV.${requiredLevel}`}
          color="#1ddeff"
        />
        <QuestBox
          title="현재 인원"
          value={`${currentParticipants}명`}
          color="#f97316"
        />
        <QuestBox
          title="최대 인원"
          value={`${maxParticipants}명`}
          color="#3b82f6"
        />
      </ThemeView>

      {/* Party Status */}
      <ThemeView style={styles.partyContainer}>
        <ThemeView style={styles.partyHeader}>
          <Typography variant="caption" style={{ color: '#90a1b9' }}>
            파티현황
          </Typography>
          <Typography variant="caption" style={{ color: '#90a1b9' }}>
            {`${currentParticipants}/${maxParticipants}`}
          </Typography>
        </ThemeView>

        {/* Progress Bar */}
        <ThemeView style={styles.progressBackground}>
          <ThemeView style={[styles.progressFill, { width: `${progress}%` }]} />
        </ThemeView>

        {/* Warning Message */}
        {isFull && (
          <ThemeView style={styles.warning}>
            <Ionicons name="warning" size={17} color="yellow" />
            <Typography variant="caption">
              파티 인원이 가득 찼습니다.
            </Typography>
          </ThemeView>
        )}
      </ThemeView>
    </ThemeView>
  );
};

export default QuestInfo;

const styles = StyleSheet.create({
  container: {
    borderColor: '#0891b2',
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

  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },

  box: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#0891b2',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 12,
  },

  boxTitle: {
    marginBottom: 8,
  },

  boxValue: {
    // Style applied via variant and color props
  },

  partyContainer: {
    gap: 8,
    borderTopColor: '#0891b2',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 8,
  },

  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#f97316',
  },

  warning: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
});
