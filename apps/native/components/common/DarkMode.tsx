import Ionicons from '@expo/vector-icons/Ionicons';
import { useUnistyles } from 'react-native-unistyles';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorSchemeStore } from '@/store/colorScheme.store';

import { IconButton } from './IconButton';

const DarkMode = () => {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useColorSchemeStore();
  const { theme } = useUnistyles();

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <IconButton
      variant="ghost"
      onPress={() => toggleColorScheme()}
      icon={
        colorScheme === 'light' ? (
          <Ionicons name="moon" size={24} color={theme.colors.text.primary} />
        ) : (
          <Ionicons name="sunny" size={24} color={theme.colors.text.primary} />
        )
      }
    />
  );
};

export default DarkMode;
