import Ionicons from '@expo/vector-icons/Ionicons';
import { formatTimeRemaining } from '@repo/shared/utils/date-utils';
import { useEffect, useState } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';

interface QuestTimeProps {
  endDate: Date;
}

const QuestTime = ({ endDate }: QuestTimeProps) => {
  const { theme } = useUnistyles();
  const [timeRemaining, setTimeRemaining] = useState(() =>
    formatTimeRemaining(new Date(), endDate),
  );

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
    <ThemeView style={styles.container} transparent>
      <Ionicons
        name="time-outline"
        size={14}
        color={theme.colors.text.secondary}
      />
      <PixelText style={styles.text}>{timeRemaining}</PixelText>
    </ThemeView>
  );
};

export default QuestTime;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  text: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
}));
