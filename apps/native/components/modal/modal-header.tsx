import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Typography } from '@/components/ui/typography';
import ThemeView from '@/components/ui/theme-view';

interface ModalHeaderProps {
  title: string;
}

const ModalHeader = ({ title }: ModalHeaderProps) => {
  const { theme } = useAppTheme();
  const isPresented = router.canGoBack();

  const handleBack = () => {
    if (isPresented) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <ThemeView style={styles.container}>
      {/* Back Button */}
      <Pressable
        onPress={handleBack}
        hitSlop={8}
        style={({ pressed }) => [
          styles.backButton,
          pressed && { opacity: 0.5 },
        ]}
      >
        <Ionicons
          name="chevron-back-outline"
          size={baseFoundation.dimension.x22}
          color={theme.colors.text.primary}
        />
      </Pressable>

      {/* Centered Title */}
      <Typography variant="subtitle" style={styles.title}>
        {title}
      </Typography>

      {/* Spacer (same width as back button for centering) */}
      <ThemeView style={styles.spacer} transparent />
    </ThemeView>
  );
};

export default ModalHeader;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.foundation.spacing.m,
    paddingHorizontal: theme.foundation.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.surface,
  },

  backButton: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
    borderRadius: baseFoundation.dimension.x20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  spacer: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
  },
}));
