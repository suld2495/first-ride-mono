'use client';

import { useEffect } from 'react';

import Button from './button/Button';
import Paragraph from './paragraph/Paragraph';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] bg-opacity-50"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-dark-primary-color rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <Paragraph
          id="dialog-title"
          className="font-semibold text-gray-900 dark:text-gray-200 mb-4"
          variant="subtitle"
        >
          {title}
        </Paragraph>

        <Paragraph
          id="dialog-description"
          className="text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-wrap"
        >
          {message}
        </Paragraph>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            className="focus:ring-blue-500 transition-colors"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            color=""
            className={`
              ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }
            `}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
