'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AchievementStakes } from '@/components/quest/AchievementStakes';
import type { PathId } from '@/store/useQuestStore';

interface PuzzleContainerProps {
  question: string;
  hint?: string;
  showHint: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  pathId: PathId;
  currentMistakes: number;
  elapsedTime: number;
  children: ReactNode;
}

export const PuzzleContainer = ({
  question,
  hint,
  showHint,
  difficulty,
  pathId,
  currentMistakes,
  elapsedTime,
  children,
}: PuzzleContainerProps) => {
  const getDifficultyStyles = () => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const getDifficultyLabel = () => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Achievement Stakes - Live Rewards Preview */}
      <AchievementStakes
        pathId={pathId}
        currentMistakes={currentMistakes}
        elapsedTime={elapsedTime}
      />

      {/* Difficulty Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-4 flex justify-center"
      >
        <Badge
          variant="outline"
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 ${getDifficultyStyles()}`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">{getDifficultyLabel()}</span>
        </Badge>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
