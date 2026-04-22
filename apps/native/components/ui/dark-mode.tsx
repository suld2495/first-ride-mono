import Ionicons from '@expo/vector-icons/Ionicons';
import { useUnistyles } from '@/lib/unistyles';
import { baseFoundation } from '@/theme/tokens';

import { useColorScheme, useSetColorScheme } from '@/hooks/useColorScheme';

import { IconButton } from './icon-button';

const DarkMode = () => {
  const colorScheme = useColorScheme();
  const setColorScheme = useSetColorScheme();
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
          <Ionicons name="moon" size={baseFoundation.iconSize.l} color={theme.colors.text.primary} />
        ) : (
          <Ionicons name="sunny" size={baseFoundation.iconSize.l} color={theme.colors.text.primary} />
        )
      }
    />
  );
};

export default DarkMode;
