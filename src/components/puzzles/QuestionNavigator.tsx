'use client';

import { motion } from 'framer-motion';
import { useQuestStore, type PathId } from '@/store/useQuestStore';
import { getPathPuzzles } from '@/data/puzzles';

interface QuestionNavigatorProps {
  pathId: PathId;
  currentPuzzleId: string | null;
  onNavigate: (puzzleId: string) => void;
}

export const QuestionNavigator = ({
  pathId,
  currentPuzzleId,
  onNavigate,
}: QuestionNavigatorProps) => {
  const puzzles = getPathPuzzles(pathId)?.puzzles || [];

  if (puzzles.length === 0) return null;

  // Calculate current question number
  const currentIndex = puzzles.findIndex((p) => p.id === currentPuzzleId);
  const currentQuestion = currentIndex !== -1 ? currentIndex + 1 : 1;
  const totalQuestions = puzzles.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-zinc-200 h-16 flex items-center justify-center shadow-lg px-4"
    >
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-lg font-semibold text-zinc-900 text-center"
      >
        Question <span className="text-festive-coral font-display text-xl">{currentQuestion}</span> of{' '}
        <span className="text-festive-coral font-display text-xl">{totalQuestions}</span>
      </motion.p>
    </motion.div>
  );
};
