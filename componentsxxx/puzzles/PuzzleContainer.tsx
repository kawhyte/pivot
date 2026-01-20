'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Zap, Clock, Trophy } from 'lucide-react';
import { formatTime } from '@/lib/themed-titles';
import type { PathId } from '@/store/useQuestStore';

interface PuzzleContainerProps {
  question: string;
  hint?: string;
  showHint: boolean;
  difficulty: 'easy' | 'medium' | 'hard'| 'very-hard';
  pathId: PathId;
  currentMistakes: number;
  elapsedTime: number;
  currentScore: number;
  targetScore: number;
  children: ReactNode;
  show?: 'friends' | 'gilmore';
  isBonusMode?: boolean; // Added for Sudden Death theming
}

export const PuzzleContainer = ({
question,
  hint,
  showHint,
  difficulty,
  children,
  show,
  isBonusMode,
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
      {/* Quest Status Pill - Horizontal Flex */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-6 hand-drawn bg-celebration-pink/10 border-3 border-celebration-pink/40 p-4"
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Difficulty Badge */}
          <div className={`hand-drawn flex items-center gap-2 px-3 py-1.5 border-3 shadow-sm ${getDifficultyStyles()}`}>
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold">{getDifficultyLabel()}</span>
          </div>

          <div className="h-5 w-px bg-deep-brown/20" />

          {/* Current Score */}
          <div className="flex items-center gap-2 text-sm font-medium text-deep-brown">
            <Trophy className="h-4 w-4 text-starbucks-green" />
            <span className="font-semibold">{currentScore} / {targetScore} Pts</span>
          </div>

          <div className="h-5 w-px bg-deep-brown/20" />

          {/* Timer */}
          <div className="flex items-center gap-2 text-sm font-medium text-deep-brown">
            <Clock className="h-4 w-4 text-starbucks-green" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-display leading-tight text-festive-brown">
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
          <div className="hand-drawn-card flex gap-3 bg-amber-50 p-5 border-2 border-amber-300">
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
