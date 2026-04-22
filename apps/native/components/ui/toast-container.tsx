import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from '@/lib/unistyles';

import { type Toast, type ToastType, useToast } from '@/contexts/ToastContext';

import { Typography } from './typography';

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const { theme } = useUnistyles();
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
  }, [opacity, translateY]);

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
      success: theme.colors.feedback.success.text,
      error: theme.colors.feedback.error.text,
      warning: theme.colors.feedback.warning.text,
      info: theme.colors.feedback.info.text,
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
          size={theme.foundation.iconSize.m}
          color={theme.colors.text.inverse}
          style={styles.icon}
        />
        <Typography color="inverse" style={styles.message}>
          {toast.message}
        </Typography>
        <Pressable
          onPress={handleClose}
          hitSlop={theme.foundation.spacing.s}
        >
          <Ionicons
            name="close"
            size={theme.foundation.iconSize.m}
            color={theme.colors.text.inverse}
          />
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

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    top: theme.foundation.dimension.x60,
    left: theme.foundation.dimension.x0,
    right: theme.foundation.dimension.x0,
    alignItems: 'center',
    zIndex: theme.foundation.zIndex.toast,
    paddingHorizontal: theme.foundation.spacing.m,
  },
  toastItem: {
    width: '100%',
    borderRadius: theme.foundation.spacing.s,
    marginBottom: theme.foundation.spacing.s,
    shadowColor: '#000',
    shadowOffset: {
      width: theme.foundation.dimension.x0,
      height: theme.foundation.dimension.x2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.foundation.dimension.x12,
    paddingHorizontal: theme.foundation.spacing.m,
  },
  icon: {
    marginRight: theme.foundation.dimension.x12,
  },
  message: {
    flex: 1,
    fontSize: theme.foundation.typography.size.m,
  },
}));
