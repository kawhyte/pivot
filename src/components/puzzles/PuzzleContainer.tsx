'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Zap } from 'lucide-react';
import type { PathId } from '@/store/useQuestStore';

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
        return 'bg-green-500 text-white border-green-500';
      case 'medium':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'hard':
        return 'bg-red-500 text-white border-red-500';
    }
  };

  const getDifficultyLabel = () => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Question with Difficulty Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
        layout
      >
        <div className="flex items-start gap-3">
          {/* Difficulty Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold shadow-sm flex-shrink-0 mt-1 ${getDifficultyStyles()}`}>
            <Zap className="h-3 w-3" />
            <span>{getDifficultyLabel()}</span>
          </div>
          {/* Question Text */}
          <h2 className="text-2xl font-display leading-tight text-festive-brown">
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
          <div className="flex gap-3 bg-amber-50 p-5 border border-amber-200 rounded-lg">
            <HelpCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900 mb-1">Hint</p>
              <p className="text-sm font-accent text-amber-800">{hint}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
