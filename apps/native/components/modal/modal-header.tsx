import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import { PixelText } from '@/components/ui/pixel-text';
import ThemeView from '@/components/ui/theme-view';

interface ModalHeaderProps {
  title: string;
}

const ModalHeader = ({ title }: ModalHeaderProps) => {
  const { theme } = useUnistyles();
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
          size={22}
          color={theme.colors.text.primary}
        />
      </Pressable>

      {/* Centered Title */}
      <PixelText variant="subtitle" style={styles.title}>
        {title}
      </PixelText>

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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    width: 40,
    height: 40,
  },
}));
