import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatTimeRemaining } from '@repo/shared/utils/date-utils';

import ThemeText from '../common/ThemeText';

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
    <View style={styles.container}>
      <Ionicons name="time-outline" size={20} color="#1ddeff" />
      <ThemeText
        variant="default"
        lightColor="#1ddeff"
        darkColor="#1ddeff"
        style={styles.text}
      >
        {timeRemaining}
      </ThemeText>
    </View>
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
