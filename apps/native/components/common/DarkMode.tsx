import Ionicons from '@expo/vector-icons/Ionicons';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useColorSchemeStore } from '@/store/colorScheme.store';
import { COLORS } from '@/theme/colors';

import { IconButton } from './IconButton';

const DarkMode = () => {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useColorSchemeStore();

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <IconButton
      variant="ghost"
      onPress={() => toggleColorScheme()}
      icon={
        colorScheme === 'light' ? (
          <Ionicons name="moon" size={24} color={COLORS.light.icon} />
        ) : (
          <Ionicons name="sunny" size={24} color={COLORS.dark.icon} />
        )
      }
    />
  );
};

export default DarkMode;
