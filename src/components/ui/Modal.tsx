import React from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { Button } from './Button';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  full: 'max-w-[calc(100%-2rem)] sm:max-w-xl',
};

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed z-50 left-1/2 -translate-x-1/2 top-[10%] sm:top-[20%]',
              'bg-white rounded-2xl shadow-2xl overflow-hidden',
              sizeMap[size],
              'w-full'
            )}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}
            <div className="px-5 py-4">{children}</div>
            {footer && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">{footer}</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Confirm Dialog
export function ConfirmDialog() {
  const confirmDialog = useAppStore((state) => state.confirmDialog);
  const hideConfirmDialog = useAppStore((state) => state.hideConfirmDialog);

  if (!confirmDialog) return null;

  const { title, message, confirmText, cancelText, variant, onConfirm, onCancel } = confirmDialog;

  const handleConfirm = () => {
    onConfirm();
    hideConfirmDialog();
  };

  const handleCancel = () => {
    onCancel?.();
    hideConfirmDialog();
  };

  return (
    <AnimatePresence>
      {confirmDialog.open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 left-1/2 -translate-x-1/2 top-[30%] max-w-sm w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 pt-6 pb-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{message}</p>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleCancel}
              >
                {cancelText || '取消'}
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                fullWidth
                onClick={handleConfirm}
              >
                {confirmText || '确定'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
