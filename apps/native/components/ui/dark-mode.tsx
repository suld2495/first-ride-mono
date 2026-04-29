import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { useColorScheme, useSetColorScheme } from '@/hooks/useColorScheme';

import { IconButton } from './icon-button';

const DarkMode = () => {
  const colorScheme = useColorScheme();
  const setColorScheme = useSetColorScheme();
  const { theme } = useAppTheme();

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
