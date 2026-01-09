'use client';

import { motion } from 'framer-motion';
import { Check, SkipForward } from 'lucide-react';
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
      className="mb-8 flex flex-wrap justify-center gap-2"
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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative h-10 w-10 rounded-full font-medium text-sm
              flex items-center justify-center
              transition-all duration-200
              ${isCurrent && 'ring-4 ring-blue-500 ring-offset-2'}
              ${
                isCompleted
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : isSkipped
                    ? 'bg-amber-400 text-amber-900 hover:bg-amber-500'
                    : isCurrent
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-zinc-300 text-zinc-600 cursor-not-allowed opacity-60'
              }
            `}
            title={`Question ${idx + 1}${isCompleted ? ' - Completed' : isSkipped ? ' - Skipped' : isCurrent ? ' - Current' : ' - Locked'}`}
          >
            {isCompleted ? (
              <Check className="h-5 w-5" />
            ) : isSkipped ? (
              <SkipForward className="h-5 w-5" />
            ) : (
              idx + 1
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};
