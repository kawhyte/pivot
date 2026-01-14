'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { MultipleChoicePuzzle as MultipleChoicePuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Button } from '@/components/ui/button';

import type { PathId } from '@/store/useQuestStore';

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
    >
      <motion.div
        className="space-y-3"
        animate={shake ? {
          x: [-4, 4, -4, 4, 0],
        } : {}}
        transition={{ duration: 0.4 }}
      >
        {puzzle.options.map((option, index) => {
          const isSelected = selectedOption === index;

          return (
            <motion.button
              key={index}
              onClick={() => setSelectedOption(index)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, rotate: isSelected ? 0 : 0.5 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative w-full hand-drawn-card border-3 p-5 text-left transition-all shadow-md
                ${
                  isSelected
                    ? 'border-celebration-pink bg-celebration-pink/20'
                    : 'border-deep-brown/20 bg-white hover:border-celebration-pink/50 hover:bg-warm-cream'
                }
                ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Radio Circle with Hand-Drawn Style */}
                <div
                  className={`
                    flex h-7 w-7 flex-shrink-0 items-center justify-center hand-drawn border-3 transition-colors
                    ${
                      isSelected
                        ? 'border-celebration-gold bg-celebration-gold'
                        : 'border-deep-brown/40 bg-white'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Check className="h-5 w-5 text-zinc-950" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                {/* Option Text */}
                <span className="text-base font-medium text-deep-brown">
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Submit Button */}
      <motion.div
        className="mt-6"
        whileHover={selectedOption !== null && !isSubmitting ? { scale: 1.02, rotate: 1 } : undefined}
        whileTap={selectedOption !== null && !isSubmitting ? { scale: 0.98 } : undefined}
      >
        <Button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className={`hand-drawn w-full py-6 text-lg font-semibold text-white shadow-md transition-all ${
            isTester
              ? 'bg-cyan-700 hover:bg-cyan-600 disabled:bg-cyan-900/30 disabled:text-cyan-700/60'
              : 'bg-zinc-900 hover:bg-zinc-800 disabled:bg-festive-brown/30 disabled:text-festive-brown/60'
          }`}
          size="lg"
        >
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </Button>
      </motion.div>
    </PuzzleContainer>
  );
};
