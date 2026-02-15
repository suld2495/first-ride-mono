import { StyleSheet } from 'react-native-unistyles';
import { useRouter } from 'expo-router';

import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/auth.store';

import { PixelText } from '../common/PixelText';
import ThemeView from '../common/ThemeView';

const QuestHeader = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // ADMIN 권한 체크
  const isAdmin = user?.role === 'ADMIN';

  return (
    <ThemeView style={styles.container}>
      <ThemeView style={styles.content}>
        <PixelText variant="title" style={styles.title}>
          퀘스트 리스트
        </PixelText>
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

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
    paddingVertical: theme.foundation.spacing.s,
    // paddingHorizontal removed
    marginTop: theme.foundation.spacing.s,
    position: 'relative',
    marginBottom: theme.foundation.spacing.s,
  },

  content: {
    width: '100%',
    alignItems: 'flex-start',
  },

  title: {
    // marginBottom removed
  },

  addButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -16 }],
    minWidth: 60,
  },
}));
