import { StyleSheet } from 'react-native-unistyles';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

const QuestHeader = () => {
  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.content}>
        <Typography variant="title" style={styles.title}>
          퀘스트 안내
        </Typography>
        <Typography variant="caption" style={styles.caption}>
          Quest List
        </Typography>
      </ThemeView>
    </ThemeView>
  );
};

export default QuestHeader;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  title: {
    marginBottom: 8,
    textShadowColor: 'rgba(176, 176, 176, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },

  caption: {
    // Style already applied via variant and color props
  },
});
