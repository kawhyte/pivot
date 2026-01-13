'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { PATH_METADATA, type PathId } from '@/store/useQuestStore';

interface KeyUnlockedToastProps {
  pathId: PathId;
  onDismiss: () => void;
}

export const KeyUnlockedToast = ({ pathId, onDismiss }: KeyUnlockedToastProps) => {
  const pathMeta = PATH_METADATA[pathId];

  // Fire confetti on mount
  useEffect(() => {
    const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

    confetti({
      particleCount: 80,
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
      <div
        className="rounded-2xl px-6 py-4 shadow-lg border-2 backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${pathMeta.colors.primary}20, ${pathMeta.colors.secondary}20)`,
          borderColor: pathMeta.colors.primary,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <Sparkles
              className="h-5 w-5"
              style={{ color: pathMeta.colors.primary }}
              strokeWidth={2}
            />
          </motion.div>
          <div className="flex flex-col gap-1">
            <p
              className="font-bold text-sm"
              style={{ color: pathMeta.colors.primary }}
            >
              Key Unlocked! 🔑
            </p>
            <p className="text-xs text-zinc-600">
              You can claim your key in the header or keep playing for a perfect run bonus!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
