'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, message, duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-200';
      default:
        return 'bg-gray-50 border-gray-500 text-gray-800 dark:bg-gray-800 dark:border-gray-400 dark:text-gray-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 min-w-[300px] max-w-[500px] p-4 mb-3
        border-l-4 rounded-r shadow-lg animate-slide-in
        ${getTypeStyles()}
      `}
      role="alert"
    >
      <span className="text-xl font-bold">{getIcon()}</span>
      <p className="flex-1 text-sm break-words">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-lg hover:opacity-70 transition-opacity"
        aria-label="닫기"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
