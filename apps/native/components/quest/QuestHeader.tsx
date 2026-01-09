import { StyleSheet } from 'react-native-unistyles';
import { useRouter } from 'expo-router';

import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/auth.store';

import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

const QuestHeader = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // ADMIN 권한 체크
  const isAdmin = user?.role === 'ADMIN';

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

      {/* ADMIN 전용 추가 버튼 */}
      {isAdmin && (
        <Button
          title="추가"
          variant="primary"
          size="sm"
          onPress={() => router.push('/modal?type=quest-add')}
          style={styles.addButton}
        />
      )}
    </ThemeView>
  );
};

export default QuestHeader;

const styles = StyleSheet.create(() => ({
  container: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    position: 'relative',
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

  addButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -16 }],
    minWidth: 60,
  },
}));
