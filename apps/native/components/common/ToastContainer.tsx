import React, { useEffect } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { feedbackColors } from '@repo/design-system';

import { type Toast, type ToastType, useToast } from '@/contexts/ToastContext';
import { useColorScheme } from '@/hooks/useColorScheme';

import { Typography } from './Typography';

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const colorScheme = useColorScheme();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Fade out animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  };

  const getBackgroundColor = () => {
    const colors = {
      success: feedbackColors.success.icon[colorScheme],
      error: feedbackColors.error.icon[colorScheme],
      warning: feedbackColors.warning.icon[colorScheme],
      info: feedbackColors.info.icon[colorScheme],
    };

    return colors[toast.type];
  };

  const getIcon = () => {
    const icons: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
      success: 'checkmark-circle',
      error: 'close-circle',
      warning: 'warning',
      info: 'information-circle',
    };

    return icons[toast.type];
  };

  return (
    <Animated.View
      style={[
        styles.toastItem,
        {
          backgroundColor: getBackgroundColor(),
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Ionicons
          name={getIcon()}
          size={20}
          color="white"
          style={styles.icon}
        />
        <Typography color="inverse" style={styles.message}>
          {toast.message}
        </Typography>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Ionicons name="close" size={20} color="white" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={hideToast} />
      ))}
    </View>
  );
};

export default ToastContainer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
  },
  toastItem: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});
