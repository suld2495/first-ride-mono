import { StyleSheet } from 'react-native-unistyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import Link from '../common/Link';
import PixelText from '../common/PixelText';
import ThemeView from '../common/ThemeView';

interface ModalHeaderProps {
  title: string;
}

const ModalHeader = ({ title }: ModalHeaderProps) => {
  const isPresented = router.canGoBack();

  return (
    <ThemeView variant="surface" style={styles.container}>
      <Link
        href={isPresented ? '..' : '/'}
        variant="ghost"
        style={styles.backButton}
        leftIcon={({ color }) => (
          <Ionicons name="chevron-back-outline" size={24} color={color} />
        )}
      />
      <PixelText variant="subtitle" style={styles.title}>{title}</PixelText>
    </ThemeView>
  );
};

export default ModalHeader;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 20,
  },

  backButton: {
    paddingHorizontal: 0,
  },

  title: {
    marginTop: -5,
  },
});
