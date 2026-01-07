'use client';

import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ImageRevealPuzzle as ImageRevealPuzzleType } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';

interface ImageRevealPuzzleProps {
  puzzle: ImageRevealPuzzleType;
  onSubmit: (answer: string) => void;
  showHint: boolean;
  isSubmitting: boolean;
}

export const ImageRevealPuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
}: ImageRevealPuzzleProps) => {
  const [answer, setAnswer] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

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
      <div className="space-y-6">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.95 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-100"
        >
          <Image
            src={puzzle.imageUrl}
            alt={puzzle.imageAlt}
            fill
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
            priority
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
            </div>
          )}
        </motion.div>

        {/* Text Input */}
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          disabled={isSubmitting}
          className={`
            w-full rounded-xl border-2 border-zinc-200 bg-white px-6 py-4
            text-base font-medium text-zinc-900 placeholder:text-zinc-400
            transition-all focus:border-zinc-900 focus:outline-none focus:ring-4 focus:ring-zinc-100
            ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}
          `}
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
