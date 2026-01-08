'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import Image from 'next/image';
import type { ImageRevealPuzzle as ImageRevealPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ImageRevealPuzzleProps {
  puzzle: ImageRevealPuzzleType;
  onSubmit: (answer: string) => void;
  showHint: boolean;
  isSubmitting: boolean;
  validationResult?: ValidationResult | null;
}

export const ImageRevealPuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
  validationResult,
}: ImageRevealPuzzleProps) => {
  const [answer, setAnswer] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (answer.trim() === '' || isSubmitting) return;

    // Trigger shake animation for "close" status
    if (validationResult?.status === 'close') {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    onSubmit(answer);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
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

        {/* Text Input with Shake Animation */}
        <motion.div
          animate={shake ? {
            x: [-4, 4, -4, 4, 0],
          } : {}}
          transition={{ duration: 0.4 }}
        >
          <Input
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            disabled={isSubmitting}
            className="h-12 rounded-xl border-2 border-zinc-300 bg-white px-6 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900"
          />
        </motion.div>

        {/* Feedback Message for "Close" Status */}
        <AnimatePresence>
          {validationResult?.status === 'close' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3"
            >
              <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-700">
                {validationResult.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          whileHover={answer.trim() !== '' && !isSubmitting ? { scale: 1.02 } : undefined}
          whileTap={answer.trim() !== '' && !isSubmitting ? { scale: 0.98 } : undefined}
        >
          <Button
            onClick={handleSubmit}
            disabled={answer.trim() === '' || isSubmitting}
            className="w-full rounded-full bg-zinc-900 py-6 text-base font-semibold text-white hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500"
            size="lg"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </motion.div>
      </div>
    </PuzzleContainer>
  );
};
