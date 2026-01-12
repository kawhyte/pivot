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
        return 'bg-festive-green text-white border-festive-green';
      case 'medium':
        return 'bg-festive-gold text-festive-brown border-festive-gold';
      case 'hard':
        return 'bg-festive-coral text-white border-festive-coral';
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
          className={`hand-drawn flex items-center gap-2 px-4 py-2 border-3 shadow-sm ${getDifficultyStyles()}`}
        >
          <Zap className="h-4 w-4" />
          <span className="text-sm font-semibold">{getDifficultyLabel()}</span>
        </Badge>
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
