'use client';

import { motion } from 'framer-motion';
import { SkipForward } from 'lucide-react';
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
  const { pathProgress } = useQuestStore();
  const progress = pathProgress[pathId];
  const puzzles = getPathPuzzles(pathId)?.puzzles || [];

  if (puzzles.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8 flex flex-wrap justify-center gap-3"
    >
      {puzzles.map((puzzle, idx) => {
        const isCompleted = progress.completedIds.includes(puzzle.id);
        const isSkipped = progress.skippedIds.includes(puzzle.id);
        const isCurrent = puzzle.id === currentPuzzleId;

        return (
          <motion.button
            key={puzzle.id}
            onClick={() => onNavigate(puzzle.id)}
            disabled={!isCompleted && !isSkipped && !isCurrent}
            whileHover={isCompleted || isSkipped || isCurrent ? { scale: 1.1, rotate: 5 } : undefined}
            whileTap={isCompleted || isSkipped || isCurrent ? { scale: 0.9 } : undefined}
            animate={isCurrent ? {
              y: [0, -5, 0],
            } : {}}
            transition={isCurrent ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            } : {}}
            className={`
              relative h-12 w-12 hand-drawn font-semibold text-sm
              flex items-center justify-center
              transition-all duration-200 shadow-md
              ${isCurrent && 'ring-4 ring-festive-coral ring-offset-2'}
              ${
                isCompleted
                  ? 'bg-festive-green text-white hover:bg-festive-green/90'
                  : isSkipped
                    ? 'bg-amber-400 text-amber-900 hover:bg-amber-500'
                    : isCurrent
                      ? 'bg-festive-coral text-white hover:bg-festive-coral/90'
                      : 'bg-festive-brown/20 text-festive-brown/40 cursor-not-allowed opacity-60'
              }
            `}
            title={`Question ${idx + 1}${isCompleted ? ' - Completed' : isSkipped ? ' - Skipped' : isCurrent ? ' - Current' : ' - Locked'}`}
          >
            {isSkipped ? (
              <SkipForward className="h-5 w-5" />
            ) : (
              <span className="font-display">{idx + 1}</span>
            )}

            {/* Decorative dot for completed */}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-festive-gold rounded-full border-2 border-white"
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};
