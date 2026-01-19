'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MultipleChoicePuzzle as MultipleChoicePuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';

import type { PathId } from '@/lib/paths';

interface MultipleChoicePuzzleProps {
  puzzle: MultipleChoicePuzzleType;
  onSubmit: (answer: number) => void;
  showHint: boolean;
  isSubmitting: boolean;
  pathId: PathId;
  currentMistakes: number;
  currentScore: number;
  targetScore: number;
  shake?: boolean;
  isTester?: boolean;
}

export const MultipleChoicePuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
  pathId,
  currentMistakes,
  currentScore,
  targetScore,
  shake = false,
  isTester = false,
}: MultipleChoicePuzzleProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedOption === null || isSubmitting) return;
    onSubmit(selectedOption);
  };

  return (
    <PuzzleContainer
      question={puzzle.question}
      hint={puzzle.hint}
      showHint={showHint}
      difficulty={puzzle.difficulty}
      pathId={pathId}
      currentMistakes={currentMistakes}
      currentScore={currentScore}
      targetScore={targetScore}
      show={puzzle.metadata?.show}
    >
      <div className="space-y-4">
        {puzzle.options.map((option, index) => {
          const isSelected = selectedOption === index;

          return (
            <motion.button
              key={index}
              onClick={() => setSelectedOption(index)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`
                duo-answer-pill w-full text-left
                ${isSelected ? 'selected' : ''}
                ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Radio Circle - Clean Duolingo Style */}
                <div
                  className={`
                    flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                    ${
                      isSelected
                        ? 'border-duolingo-green border-[6px] bg-white'
                        : 'border-neutral-300 bg-white'
                    }
                  `}
                >
                </div>

                {/* Option Text */}
                <span className="text-base font-semibold text-neutral-900">
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className={`duo-button w-full py-4 text-lg font-bold text-white ${
            isTester
              ? 'bg-cyan-700 hover:bg-cyan-600 disabled:bg-neutral-300 disabled:text-neutral-500'
              : 'bg-duolingo-green hover:bg-duolingo-green-dark disabled:bg-neutral-300 disabled:text-neutral-500'
          }`}
        >
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </button>
      </div>
    </PuzzleContainer>
  );
};
