import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatTimeRemaining } from '@repo/shared/utils/date-utils';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface QuestTimeProps {
  endDate: Date;
}

const QuestTime = ({ endDate }: QuestTimeProps) => {
  const [timeRemaining, setTimeRemaining] = useState('D-0');

  useEffect(() => {
    let start = 0;
    const timer = (time: number) => {
      if (!start) {
        start = time;
      }

      if (time - start >= 1000) {
        start = time;
        setTimeRemaining(formatTimeRemaining(new Date(), endDate));
      }

      rAF = requestAnimationFrame(timer);
    };

    let rAF = requestAnimationFrame(timer);

    return () => {
      cancelAnimationFrame(rAF);
    };
  }, [endDate]);

  return (
    <ThemeView style={styles.container}>
      <Ionicons name="time-outline" size={20} color="#1ddeff" />
      <Typography variant="body" style={styles.text}>
        {timeRemaining}
      </Typography>
    </ThemeView>
  );
};

export default QuestTime;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderColor: '#0891b2',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 4,
  },

  text: {
    // Style applied via variant and color props
  },
});
