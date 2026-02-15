import { StyleSheet, useUnistyles } from 'react-native-unistyles';
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
  const { theme } = useUnistyles();
  const progress = (currentParticipants / maxParticipants) * 100;
  const isFull = currentParticipants === maxParticipants;

  return (
    <ThemeView style={styles.container}>
      {/* Header */}
      <ThemeView style={styles.header} transparent>
        <Ionicons
          name="flash-outline"
          size={20}
          color={theme.colors.action.primary.default}
        />
        <Typography variant="body" style={styles.headerText}>
          QUEST INFO
        </Typography>
      </ThemeView>

      {/* Info Boxes */}
      <ThemeView style={styles.boxesContainer}>
        <QuestBox
          title="최소 레벨"
          value={`LV.${requiredLevel}`}
          color={theme.colors.action.primary.default}
        />
        <QuestBox
          title="현재 인원"
          value={`${currentParticipants}명`}
          color={theme.colors.feedback.warning.text}
        />
        <QuestBox
          title="최대 인원"
          value={`${maxParticipants}명`}
          color={theme.colors.feedback.info.text}
        />
      </ThemeView>

      {/* Party Status */}
      <ThemeView style={styles.partyContainer}>
        <ThemeView style={styles.partyHeader}>
          <Typography variant="caption" color="secondary">
            파티현황
          </Typography>
          <Typography variant="caption" color="secondary">
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
            <Ionicons
              name="warning"
              size={17}
              color={theme.colors.feedback.warning.text}
            />
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

const styles = StyleSheet.create((theme) => ({
  container: {
    // Border removed
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
    backgroundColor: theme.colors.background.base,
    borderRadius: theme.foundation.radii.s,
    paddingVertical: 12,
  },

  boxTitle: {
    marginBottom: 8,
    color: theme.colors.text.tertiary,
  },

  boxValue: {
    fontWeight: '600',
  },

  partyContainer: {
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    paddingHorizontal: theme.foundation.spacing.s,
  },

  partyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.background.sunken,
    borderRadius: theme.foundation.radii.s,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.feedback.warning.text,
  },

  warning: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
}));
