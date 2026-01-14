'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="duo-card bg-white p-6">
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div
                  className={`
                    h-12 w-12 rounded-full flex items-center justify-center
                    ${
                      variant === 'danger'
                        ? 'bg-error-red/10'
                        : 'bg-warning-orange/10'
                    }
                  `}
                >
                  <AlertCircle
                    className={`h-6 w-6 ${
                      variant === 'danger' ? 'text-error-red' : 'text-warning-orange'
                    }`}
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">
                  {title}
                </h2>
                <p className="text-sm text-neutral-700">
                  {description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="duo-button flex-1 bg-neutral-200 text-neutral-900 hover:bg-neutral-300 py-3 text-base font-bold"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`
                    duo-button flex-1 py-3 text-base font-bold text-white
                    ${
                      variant === 'danger'
                        ? 'bg-error-red hover:bg-error-red/90'
                        : 'bg-duolingo-green hover:bg-duolingo-green-dark'
                    }
                  `}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
