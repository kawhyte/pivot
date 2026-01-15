'use client';

import { motion } from 'framer-motion';
import { Heart, Flame, Shield } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';

interface PerfectRunFailureModalProps {
  pathId: PathId;
  streak: number;
  remainingPuzzles: number;
  onClose: () => void;
  isTester?: boolean;
}

export const PerfectRunFailureModal = ({
  pathId,
  streak,
  onClose,
  isTester = false,
}: PerfectRunFailureModalProps) => {
  const pathMeta = PATH_METADATA[pathId];

  return (
    <>
      {/* Backdrop Overlay */}
      <motion.div
        className="duo-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Modal Container */}
      <div className="duo-modal">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4 flex justify-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-400">
            <Heart className="h-8 w-8 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-2 text-center text-2xl font-bold ${
            isTester ? 'text-cyan-400' : 'text-neutral-900'
          }`}
        >
          Perfect Run Ended
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-4 text-center text-sm ${
            isTester ? 'text-zinc-300' : 'text-neutral-700'
          }`}
        >
          One wrong answer ended the perfect run attempt.
        </motion.p>

        {/* Streak Display (if > 0) */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 px-4 py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <p className="text-lg font-bold text-neutral-900">
                You reached a streak of <span className="text-orange-600">{streak}</span>!
              </p>
            </div>
          </motion.div>
        )}

        {/* Reassurance Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 rounded-xl bg-duolingo-green/10 px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-duolingo-green" />
            <div>
              <p className="font-semibold text-neutral-900">Your 91% key is safe!</p>
              <p className="mt-1 text-sm text-neutral-700">
                All your progress has been saved. You can return to the vault now.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Return to Vault Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onClose}
          className={`duo-button w-full py-4 text-white ${
            isTester
              ? 'bg-cyan-600 hover:bg-cyan-500'
              : 'bg-duolingo-green hover:bg-duolingo-green-dark'
          }`}
        >
          <span className="font-bold">Return to Vault</span>
        </motion.button>
      </div>
    </>
  );
};
