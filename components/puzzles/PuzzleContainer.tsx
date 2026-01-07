'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface PuzzleContainerProps {
  question: string;
  hint?: string;
  showHint: boolean;
  children: ReactNode;
}

export const PuzzleContainer = ({
  question,
  hint,
  showHint,
  children,
}: PuzzleContainerProps) => {
  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold leading-tight text-zinc-900">
          {question}
        </h2>
      </motion.div>

      {/* Puzzle Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.div>

      {/* Hint */}
      {showHint && hint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-6 overflow-hidden"
        >
          <div className="flex gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200">
            <HelpCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">Hint</p>
              <p className="text-sm text-amber-800">{hint}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
