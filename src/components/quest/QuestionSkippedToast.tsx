'use client';

import { motion } from 'framer-motion';
import { SkipForward, Clock } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';

interface QuestionSkippedToastProps {
  pathId: PathId;
  onDismiss: () => void;
  isTester?: boolean;
}

export const QuestionSkippedToast = ({
  pathId,
  onDismiss,
  isTester = false,
}: QuestionSkippedToastProps) => {
  const pathMeta = PATH_METADATA[pathId];

  return (
    <>
      {/* Semi-transparent backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
        onClick={onDismiss}
      />

      {/* Toast Container - Centered with Flexbox */}
      <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-[90%] max-w-md pointer-events-auto"
        >
          <div
            className="rounded-2xl bg-white p-6 shadow-2xl border-2"
            style={{ borderColor: pathMeta.colors.secondary }}
          >
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${pathMeta.colors.primary}20, ${pathMeta.colors.secondary}20)`,
                  border: `3px solid ${pathMeta.colors.primary}`,
                }}
              >
                <SkipForward
                  className="h-8 w-8"
                  style={{ color: pathMeta.colors.primary }}
                  strokeWidth={2.5}
                />
              </div>
            </div>

            {/* Title */}
            <h3
              className={`mb-2 text-center text-3xl font-doodle font-bold ${
                isTester ? 'text-cyan-400' : 'text-neutral-900'
              }`}
            >
              Question Skipped
            </h3>

            {/* Message */}
            <p
              className={`mb-4 text-center text-lg ${
                isTester ? 'text-zinc-300' : 'text-neutral-700'
              }`}
            >
              Don't worry! This question will be available to try again later.
            </p>

            {/* Info Box */}
            <div className="rounded-xl bg-neutral-100 px-4 py-3">
              <div className="flex items-center justify-center gap-2 text-neutral-600">
                <Clock className="h-5 w-5" />
                <span className="text-base font-semibold">Moving to next question...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
