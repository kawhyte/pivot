'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import type { PathId } from '@/lib/paths';
import { Badge } from '@/components/ui/badge'; // Ensure this is installed
import { cn } from '@/lib/utils';
import { ShowBadge } from './ShowBadge';

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
  show?: 'friends' | 'gilmore';
  isBonusMode?: boolean;
}

export const PuzzleContainer = ({
  question,
  hint,
  showHint,
  difficulty,
  children,
  show,
  isBonusMode = false,
}: PuzzleContainerProps) => {
  
  // Mapping difficulty to shadcn-compatible Tailwind classes
  const difficultyConfig = {
    easy: {
      label: 'Easy',
      className: 'bg-green-500 hover:bg-green-600 text-white border-none',
    },
    medium: {
      label: 'Medium',
      className: 'bg-yellow-400 hover:bg-yellow-500 text-black border-none',
    },
    hard: {
      label: 'Hard',
      className: 'bg-red-500 hover:bg-red-600 text-white border-none',
    },
    'very-hard': {
    label: 'Legendary',
    className: 'bg-purple-600 hover:bg-purple-700 text-white border-none animate-pulse',
  },
  };

  const currentDifficulty = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.hard;

  return (
    <div className="mx-auto w-full max-w-lg px-6 sm:px-0">
      {/* Question with Difficulty Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
        layout
      >
        {/* Badge Row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn(
            "mission-label text-3xl font-medium",
            isBonusMode ? 'text-red-400/90' : 'text-neutral-700'
          )}>
            Difficulty:
          </span>
          <Badge
            className={cn(
              "rounded-2xl px-4 py-1 text-sm font-bold uppercase tracking-wider shadow-sm",
              currentDifficulty.className
            )}
          >
            {currentDifficulty.label}
          </Badge>
          <ShowBadge show={show} />
        </div>

        {/* Question Text */}
        <h2 className={cn(
          "text-4xl font-doodle font-bold leading-normal tracking-wide",
          isBonusMode ? 'text-white' : 'text-neutral-900'
        )}>
          {question}
        </h2>

        {/* Decorative Divider */}
        <div className={cn(
          "h-1 w-12 rounded-full mt-4",
          isBonusMode ? 'bg-red-600' : 'bg-neutral-200'
        )} />
      </motion.div>

      {/* Puzzle Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        layout
        className="text-xl"
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
          <div className="duo-card flex gap-3 bg-blue-50 border-blue-200 p-5 rounded-xl border">
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