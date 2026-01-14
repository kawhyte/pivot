'use client';

import { motion } from 'framer-motion';
import type { PathId } from '@/store/useQuestStore';
import type { Puzzle } from '@/types/puzzle';

interface QuestionNavigatorProps {
  pathId: PathId;
  currentPuzzleId: string | null;
  remainingPuzzles: Puzzle[];
  onNavigate: (puzzleId: string) => void;
}

export const QuestionNavigator = ({
  pathId,
  currentPuzzleId,
  remainingPuzzles,
  onNavigate,
}: QuestionNavigatorProps) => {
  if (remainingPuzzles.length === 0) return null;

  // Calculate current position within remaining puzzles
  const currentIndex = remainingPuzzles.findIndex((p) => p.id === currentPuzzleId);
  const currentPosition = currentIndex !== -1 ? currentIndex + 1 : 1;
  const remainingTotal = remainingPuzzles.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-zinc-200 h-16 flex items-center justify-center shadow-lg px-4"
      layout
    >
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-lg font-semibold text-zinc-900 text-center"
        layout
      >
        Questions Remaining:{' '}
        {/* <span className="text-festive-coral font-display text-xl">{currentPosition}</span> of{' '} */}
        <span className="text-festive-coral font-display text-xl">{remainingTotal}</span>
      </motion.p>
    </motion.div>
  );
};
