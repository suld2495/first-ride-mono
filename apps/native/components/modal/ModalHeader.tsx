import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import Link from '../common/Link';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

interface ModalHeaderProps {
  title: string;
}

const ModalHeader = ({ title }: ModalHeaderProps) => {
  const isPresented = router.canGoBack();

  return (
    <ThemeView variant="raised" style={styles.container}>
      <Link
        href={isPresented ? '..' : '/'}
        variant="ghost"
        style={styles.backButton}
        leftIcon={({ color }) => (
          <Ionicons name="chevron-back-outline" size={24} color={color} />
        )}
      />
      <Typography style={styles.title}>{title}</Typography>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -5,
  },
});
