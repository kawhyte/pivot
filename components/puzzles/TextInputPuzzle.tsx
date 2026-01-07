'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import type { TextInputPuzzle as TextInputPuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';

interface TextInputPuzzleProps {
  puzzle: TextInputPuzzleType;
  onSubmit: (answer: string) => void;
  showHint: boolean;
  isSubmitting: boolean;
}

export const TextInputPuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
}: TextInputPuzzleProps) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim() === '' || isSubmitting) return;
    onSubmit(answer);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <PuzzleContainer
      question={puzzle.question}
      hint={puzzle.hint}
      showHint={showHint}
    >
      <div className="space-y-4">
        {/* Text Input */}
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={puzzle.placeholder || 'Type your answer...'}
          disabled={isSubmitting}
          className={`
            w-full rounded-xl border-2 border-zinc-200 bg-white px-6 py-4
            text-base font-medium text-zinc-900 placeholder:text-zinc-400
            transition-all focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-100
            ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
          `}
          autoFocus
        />

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={answer.trim() === '' || isSubmitting}
          whileHover={answer.trim() !== '' && !isSubmitting ? { scale: 1.02 } : undefined}
          whileTap={answer.trim() !== '' && !isSubmitting ? { scale: 0.98 } : undefined}
          className={`
            w-full rounded-full py-4 font-semibold transition-all
            ${
              answer.trim() !== '' && !isSubmitting
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'cursor-not-allowed bg-zinc-200 text-zinc-400'
            }
          `}
        >
          {isSubmitting ? 'Checking...' : 'Submit Answer'}
        </motion.button>
      </div>
    </PuzzleContainer>
  );
};
