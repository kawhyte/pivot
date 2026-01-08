'use client';

import type { Puzzle, ValidationResult } from '@/types/puzzle';
import type { PathId } from '@/store/useQuestStore';
import { MultipleChoicePuzzle } from './MultipleChoicePuzzle';
import { TextInputPuzzle } from './TextInputPuzzle';
import { ImageRevealPuzzle } from './ImageRevealPuzzle';

interface PuzzleRendererProps {
  puzzle: Puzzle;
  onSubmit: (answer: string | number) => void;
  showHint: boolean;
  isSubmitting: boolean;
  validationResult?: ValidationResult | null;
  pathId: PathId;
  currentMistakes: number;
  elapsedTime: number;
}

export const PuzzleRenderer = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
  validationResult,
  pathId,
  currentMistakes,
  elapsedTime,
}: PuzzleRendererProps) => {
  switch (puzzle.type) {
    case 'multiple-choice':
      return (
        <MultipleChoicePuzzle
          puzzle={puzzle}
          onSubmit={onSubmit as (answer: number) => void}
          showHint={showHint}
          isSubmitting={isSubmitting}
          pathId={pathId}
          currentMistakes={currentMistakes}
          elapsedTime={elapsedTime}
        />
      );

    case 'text-input':
      return (
        <TextInputPuzzle
          puzzle={puzzle}
          onSubmit={onSubmit as (answer: string) => void}
          showHint={showHint}
          isSubmitting={isSubmitting}
          validationResult={validationResult}
          pathId={pathId}
          currentMistakes={currentMistakes}
          elapsedTime={elapsedTime}
        />
      );

    case 'image-reveal':
      return (
        <ImageRevealPuzzle
          puzzle={puzzle}
          onSubmit={onSubmit as (answer: string) => void}
          showHint={showHint}
          isSubmitting={isSubmitting}
          validationResult={validationResult}
          pathId={pathId}
          currentMistakes={currentMistakes}
          elapsedTime={elapsedTime}
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
