'use client';

import type { PathId } from '@/lib/paths';
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

  const remainingTotal = remainingPuzzles.length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-neutral-200 h-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
          Remaining
        </p>
        <p className="text-4xl font-black text-duolingo-green">
          {remainingTotal}
        </p>
      </div>
    </div>
  );
};
