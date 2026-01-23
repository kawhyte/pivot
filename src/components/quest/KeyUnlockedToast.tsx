'use client';

import { motion } from 'framer-motion';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { PATH_METADATA, type PathId } from '@/lib/paths';

interface KeyUnlockedToastProps {
  pathId: PathId;
  onDismiss: () => void;
}

export const KeyUnlockedToast = ({ pathId, onDismiss }: KeyUnlockedToastProps) => {
  const pathMeta = PATH_METADATA[pathId];

  // Fire confetti on mount (reduced particles)
  useEffect(() => {
    const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
      colors,
    });

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [pathMeta, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="duo-card px-6 py-4 bg-success-bg border-duolingo-green border-[3px]">
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-5 w-5 text-duolingo-green flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-bold text-sm text-neutral-900">
              Key Unlocked! 🔑
            </p>
            <p className="text-xs text-neutral-700">
              You can claim your key in the header or keep playing for a perfect run bonus!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
