import { StyleSheet, View } from 'react-native';

import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

const QuestHeader = () => {
  return (
    <ThemeView style={styles.container}>
      <View style={styles.content}>
        <ThemeText
          variant="title"
          lightColor="#e0f2fe"
          darkColor="#e0f2fe"
          style={styles.title}
        >
          퀘스트 안내
        </ThemeText>
        <ThemeText
          variant="caption"
          lightColor="#0891b2"
          darkColor="#0891b2"
          style={styles.caption}
        >
          Quest List
        </ThemeText>
      </View>
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
