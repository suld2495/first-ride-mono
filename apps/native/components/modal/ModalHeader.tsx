import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { COLORS } from '@/theme/colors';

import Link from '../common/Link';
import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

interface ModalHeaderProps {
  title: string;
}

const ModalHeader = ({ title }: ModalHeaderProps) => {
  const isPresented = router.canGoBack();
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  return (
    <ThemeView style={styles.container}>
      <Link
        href={isPresented ? '..' : '/'}
        variant="plain"
        style={styles.backButton}
        icon={
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={COLORS[colorScheme].icon}
          />
        }
      />
      <ThemeText
        lightColor={COLORS[colorScheme].text}
        darkColor={COLORS[colorScheme].text}
        style={styles.title}
      >
        {title}
      </ThemeText>
    </ThemeView>
  );
};

export default ModalHeader;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
      paddingHorizontal: 10,
      gap: 20,
      backgroundColor: COLORS[colorScheme].backgroundGrey,
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
