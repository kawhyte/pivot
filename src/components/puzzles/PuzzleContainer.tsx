'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Zap } from 'lucide-react';
import type { PathId } from '@/lib/paths';

interface PuzzleContainerProps {
  question: string;
  hint?: string;
  showHint: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  pathId: PathId;
  currentMistakes: number;
  currentScore: number;
  targetScore: number;
  children: ReactNode;
}

export const PuzzleContainer = ({
  question,
  hint,
  showHint,
  difficulty,
  pathId,
  currentMistakes,
  currentScore,
  targetScore,
  children,
}: PuzzleContainerProps) => {
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'easy':
        return 'duo-badge-green';
      case 'medium':
        return 'duo-badge-yellow';
      case 'hard':
        return 'duo-badge-red';
    }
  };

  const getDifficultyLabel = () => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="mx-auto w-full max-w-lg px-6 sm:px-0">
      {/* Question with Difficulty Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
        layout
      >
        <div className="flex flex-wrap items-start gap-3">
          {/* Difficulty Badge */}
          <span className={`duo-badge flex-shrink-0 ${getDifficultyStyles()}`}>
            <Zap className="h-3 w-3" />
            {getDifficultyLabel()}
          </span>
          {/* Question Text */}
          <h2 className="text-2xl font-bold leading-tight text-neutral-900 flex-1">
            {question}
          </h2>
        </div>
      </motion.div>

      {/* Puzzle Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        layout
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
          layout
        >
          <div className="duo-card flex gap-3 bg-blue-50 border-blue-200 p-5">
            <HelpCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">Hint</p>
              <p className="text-sm font-semibold text-blue-800">{hint}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
