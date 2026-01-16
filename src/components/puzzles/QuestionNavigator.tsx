'use client';

import { Check } from 'lucide-react';
import type { PathId } from '@/lib/paths';
import type { Puzzle } from '@/types/puzzle';
import { cn } from '@/lib/utils';

interface QuestionNavigatorProps {
  pathId: PathId;
  currentPuzzleId: string | null;
  allPuzzles: Puzzle[];
  completedIds: string[];
  onNavigate: (puzzleId: string) => void;
}

export const QuestionNavigator = ({
  pathId,
  currentPuzzleId,
  allPuzzles,
  completedIds,
  onNavigate,
}: QuestionNavigatorProps) => {
  if (allPuzzles.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-neutral-200 h-24 flex items-center justify-center px-6">
      <div className="mx-auto max-w-3xl w-full">
        <p className="text-center mission-label mb-3">
          Mission Log
        </p>

        {/* Centered dots container with fixed height */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto">
          {allPuzzles.map((puzzle) => {
            const isCompleted = completedIds.includes(puzzle.id);
            const isCurrent = puzzle.id === currentPuzzleId;
            const isRemaining = !isCompleted && !isCurrent;

            return (
              <button
                key={puzzle.id}
                onClick={() => onNavigate(puzzle.id)}
                className="flex-shrink-0 transition-all"
                aria-label={`Puzzle ${puzzle.id}`}
              >
                {/* Completed: Small green circle with Check */}
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-duolingo-green flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Current: Larger dot with doodle-sticker */}
                {isCurrent && (
                  <div className="w-10 h-10 rounded-full bg-neutral-300 flex items-center justify-center doodle-sticker" />
                )}

                {/* Remaining: Neutral circle with dashed border */}
                {isRemaining && (
                  <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-dashed border-neutral-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
