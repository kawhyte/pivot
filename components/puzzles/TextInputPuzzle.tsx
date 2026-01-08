'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import type { TextInputPuzzle as TextInputPuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
        <Input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={puzzle.placeholder || 'Type your answer...'}
          disabled={isSubmitting}
          className="h-12 rounded-xl border-2 px-6 text-base"
          autoFocus
        />

        {/* Submit Button */}
        <motion.div
          whileHover={answer.trim() !== '' && !isSubmitting ? { scale: 1.02 } : undefined}
          whileTap={answer.trim() !== '' && !isSubmitting ? { scale: 0.98 } : undefined}
        >
          <Button
            onClick={handleSubmit}
            disabled={answer.trim() === '' || isSubmitting}
            className="w-full rounded-full py-6 text-base font-semibold"
            size="lg"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </motion.div>
      </div>
    </PuzzleContainer>
  );
};
