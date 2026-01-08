'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { MultipleChoicePuzzle as MultipleChoicePuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Button } from '@/components/ui/button';

interface MultipleChoicePuzzleProps {
  puzzle: MultipleChoicePuzzleType;
  onSubmit: (answer: number) => void;
  showHint: boolean;
  isSubmitting: boolean;
}

export const MultipleChoicePuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
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
    >
      <div className="space-y-3">
        {puzzle.options.map((option, index) => {
          const isSelected = selectedOption === index;

          return (
            <motion.button
              key={index}
              onClick={() => setSelectedOption(index)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`
                relative w-full rounded-xl border-2 p-4 text-left transition-all
                ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                }
                ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Radio Circle */}
                <div
                  className={`
                    flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors
                    ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900'
                        : 'border-zinc-300'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                {/* Option Text */}
                <span className="text-base font-medium text-zinc-900">
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button */}
      <motion.div
        className="mt-6"
        whileHover={selectedOption !== null && !isSubmitting ? { scale: 1.02 } : undefined}
        whileTap={selectedOption !== null && !isSubmitting ? { scale: 0.98 } : undefined}
      >
        <Button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className="w-full rounded-full bg-zinc-900 py-6 text-base font-semibold text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
          size="lg"
        >
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </Button>
      </motion.div>
    </PuzzleContainer>
  );
};
