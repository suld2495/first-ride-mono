import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Pressable } from 'react-native';

import ModalHeaderActionContext from '@/components/modal/modal-header-action-context';
import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { baseFoundation } from '@/theme/tokens';

interface ModalHeaderProps {
  title: string;
  transparent?: boolean;
}

const ModalHeader = ({ title, transparent = false }: ModalHeaderProps) => {
  const { theme } = useAppTheme();
  const isPresented = router.canGoBack();
  const actionContext = useContext(ModalHeaderActionContext);
  const headerAction = actionContext?.action ?? null;

  const handleBack = () => {
    if (isPresented) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <ThemeView style={styles.container} transparent={transparent}>
      {/* Back Button */}
      <Pressable
        onPress={handleBack}
        hitSlop={baseFoundation.spacing[2]}
        style={({ pressed }) => [
          styles.backButton,
          pressed && { opacity: 0.5 },
        ]}
      >
        <Ionicons
          name="chevron-back-outline"
          size={baseFoundation.dimension.x22}
          color={theme.colors.text.title}
        />
      </Pressable>

      {/* Centered Title */}
      <Typography variant="body1" weight="semibold" style={styles.title}>
        {title}
      </Typography>

      {headerAction ? (
        <ThemeView style={styles.actionSlot} transparent>
          {headerAction}
        </ThemeView>
      ) : (
        <ThemeView style={styles.spacer} transparent />
      )}
    </ThemeView>
  );
};

export default ModalHeader;

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.foundation.spacing[2],
    paddingHorizontal: theme.foundation.spacing[6],
  },

  backButton: {
    zIndex: 1,
    width: baseFoundation.dimension.x22,
    height: baseFoundation.dimension.x22,
    borderRadius: baseFoundation.dimension.x20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.3,
    color: theme.colors.text.title,
  },

  spacer: {
    width: baseFoundation.dimension.x40,
    height: baseFoundation.dimension.x40,
  },
  actionSlot: {
    zIndex: 1,
    minWidth: baseFoundation.dimension.x40,
    minHeight: baseFoundation.dimension.x40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
}));
