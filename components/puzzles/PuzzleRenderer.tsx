'use client';

import type { Puzzle } from '@/types/puzzle';
import { MultipleChoicePuzzle } from './MultipleChoicePuzzle';
import { TextInputPuzzle } from './TextInputPuzzle';
import { ImageRevealPuzzle } from './ImageRevealPuzzle';

interface PuzzleRendererProps {
  puzzle: Puzzle;
  onSubmit: (answer: string | number) => void;
  showHint: boolean;
  isSubmitting: boolean;
}

export const PuzzleRenderer = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
}: PuzzleRendererProps) => {
  switch (puzzle.type) {
    case 'multiple-choice':
      return (
        <MultipleChoicePuzzle
          puzzle={puzzle}
          onSubmit={onSubmit as (answer: number) => void}
          showHint={showHint}
          isSubmitting={isSubmitting}
        />
      );

    case 'text-input':
      return (
        <TextInputPuzzle
          puzzle={puzzle}
          onSubmit={onSubmit as (answer: string) => void}
          showHint={showHint}
          isSubmitting={isSubmitting}
        />
      );

    case 'image-reveal':
      return (
        <ImageRevealPuzzle
          puzzle={puzzle}
          onSubmit={onSubmit as (answer: string) => void}
          showHint={showHint}
          isSubmitting={isSubmitting}
        />
      );

    default:
      return (
        <div className="rounded-xl bg-red-50 p-6 text-center">
          <p className="text-red-900 font-medium">
            Unknown puzzle type. Please contact support.
          </p>
        </div>
      );
  }
};
