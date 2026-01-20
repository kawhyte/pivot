'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { MultipleChoicePuzzle as MultipleChoicePuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Ensure you have a utility for class merging

import type { PathId } from '@/store/useQuestStore';

interface MultipleChoicePuzzleProps {
  puzzle: MultipleChoicePuzzleType;
  onSubmit: (answer: number) => void;
  showHint: boolean;
  isSubmitting: boolean;
  pathId: PathId;
  currentMistakes: number;
  elapsedTime: number;
  currentScore: number;
  targetScore: number;
  isBonusMode?: boolean; // Add this prop
}

export const MultipleChoicePuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
  pathId,
  currentMistakes,
  elapsedTime,
  currentScore,
  targetScore,
  isBonusMode = false, // Default to false
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
      elapsedTime={elapsedTime}
      currentScore={currentScore}
      targetScore={targetScore}
      isBonusMode={isBonusMode} // Pass down to container
    >
      <div className="space-y-3">
        {puzzle.options.map((option, index) => {
          const isSelected = selectedOption === index;

          return (
            <motion.button
              key={index}
              onClick={() => setSelectedOption(index)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02, rotate: isSelected ? 0 : 0.5 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full hand-drawn-card border-3 p-5 text-left transition-all shadow-md",
                // Conditional styling for Bonus Mode vs Regular Mode
                isBonusMode
                  ? isSelected
                    ? 'border-red-500 bg-red-950/40' 
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-red-900/50 hover:bg-zinc-900/80'
                  : isSelected
                    ? 'border-celebration-pink bg-celebration-pink/20'
                    : 'border-deep-brown/20 bg-white hover:border-celebration-pink/50 hover:bg-warm-cream',
                isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Radio Circle with Hand-Drawn Style */}
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center hand-drawn border-3 transition-colors",
                    isBonusMode
                      ? isSelected
                        ? 'border-red-500 bg-red-600'
                        : 'border-zinc-700 bg-zinc-950'
                      : isSelected
                        ? 'border-celebration-gold bg-celebration-gold'
                        : 'border-deep-brown/40 bg-white'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Check 
                        className={cn("h-5 w-5", isBonusMode ? "text-white" : "text-zinc-950")} 
                        strokeWidth={3} 
                      />
                    </motion.div>
                  )}
                </div>

                {/* Option Text - Dynamic Color */}
                <span className={cn(
                  "text-base font-medium",
                  isBonusMode ? "text-white" : "text-deep-brown"
                )}>
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
        whileHover={selectedOption !== null && !isSubmitting ? { scale: 1.02, rotate: 1 } : undefined}
        whileTap={selectedOption !== null && !isSubmitting ? { scale: 0.98 } : undefined}
      >
        <Button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className={cn(
            "hand-drawn w-full py-6 text-lg font-semibold text-white shadow-md transition-all",
            isBonusMode
              ? "bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500"
              : "bg-festive-coral hover:bg-festive-coral/90 disabled:bg-festive-brown/30 disabled:text-festive-brown/60"
          )}
          size="lg"
        >
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </Button>
      </motion.div>
    </PuzzleContainer>
  );
};