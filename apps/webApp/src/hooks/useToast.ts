import { useCallback, useState } from 'react';

import type { ToastType } from '@/components/common/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (type: ToastType, message: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastItem = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast('success', message, duration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast('error', message, duration);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast('warning', message, duration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast('info', message, duration);
    },
    [showToast],
  );

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast,
  };
};
