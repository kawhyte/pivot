'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
  duration?: number;
}

export const Toast = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info',
  duration = 5000,
}: ToastProps) => {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onOpenChange]);

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-duolingo-green flex-shrink-0" strokeWidth={2} />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error-red flex-shrink-0" strokeWidth={2} />;
      case 'info':
        return <Info className="h-5 w-5 text-warning-orange flex-shrink-0" strokeWidth={2} />;
    }
  };

  const getStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-success-bg border-duolingo-green';
      case 'error':
        return 'bg-red-50 border-error-red';
      case 'info':
        return 'bg-blue-50 border-blue-400';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-6 left-1/2 z-50 -translate-x-1/2 max-w-md w-full mx-4"
        >
          <div className={`duo-card px-6 py-4 border-[3px] ${getStyles()}`}>
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-neutral-900">
                  {title}
                </p>
                {description && (
                  <p className="text-xs text-neutral-700 mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0 text-neutral-500 hover:text-neutral-900 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
