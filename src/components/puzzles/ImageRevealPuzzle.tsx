'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { ImageRevealPuzzle as ImageRevealPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PathId } from '@/store/useQuestStore';

interface ImageRevealPuzzleProps {
  puzzle: ImageRevealPuzzleType;
  onSubmit: (answer: string) => void;
  showHint: boolean;
  isSubmitting: boolean;
  validationResult?: ValidationResult | null;
  pathId: PathId;
  currentMistakes: number;
  currentScore: number;
  targetScore: number;
  shake?: boolean;
}

export const ImageRevealPuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
  validationResult,
  pathId,
  currentMistakes,
  currentScore,
  targetScore,
  shake = false,
}: ImageRevealPuzzleProps) => {
  const [answer, setAnswer] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [closeShake, setCloseShake] = useState(false);

  const handleSubmit = () => {
    if (answer.trim() === '' || isSubmitting) return;

    // Trigger shake animation for "close" status
    if (validationResult?.status === 'close') {
      setCloseShake(true);
      setTimeout(() => setCloseShake(false), 400);
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
      difficulty={puzzle.difficulty}
      pathId={pathId}
      currentMistakes={currentMistakes}
      currentScore={currentScore}
      targetScore={targetScore}
    >
      <div className="space-y-6">
        {/* SVG Rough-Edge Mask Definition */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <clipPath id="rough-edge-mask" clipPathUnits="objectBoundingBox">
              <path
                d="M 0.02,0.05
                   C 0.01,0.02 0.05,0.01 0.08,0.01
                   L 0.92,0.02
                   C 0.95,0.02 0.98,0.04 0.99,0.07
                   L 0.98,0.93
                   C 0.98,0.96 0.95,0.99 0.92,0.99
                   L 0.08,0.98
                   C 0.05,0.98 0.02,0.96 0.01,0.93
                   L 0.02,0.05 Z"
                fill="white"
              />
            </clipPath>
          </defs>
        </svg>

        {/* Image with Rough-Edge Mask & Wiggle Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: imageLoaded ? 1 : 0,
            scale: imageLoaded ? 1 : 0.95,
            rotate: imageLoaded ? [0, -2, 2, -1, 1, 0] : 0,
          }}
          transition={{
            duration: imageLoaded ? 0.6 : 0.4,
            rotate: { delay: 0.3, duration: 0.5 },
          }}
          className="relative aspect-video w-full overflow-visible"
        >
          <div
            className="relative w-full h-full hand-drawn-card bg-white p-2 shadow-lg"
            style={{
              clipPath: 'url(#rough-edge-mask)',
            }}
          >
            <img
              src={puzzle.imageUrl}
              alt={puzzle.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-festive-cream">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-festive-coral border-t-transparent" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Text Input with Shake Animation */}
        <motion.div
          animate={shake || closeShake ? {
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
            className="hand-drawn h-14 border-3 border-festive-brown/20 bg-white px-6 text-base text-festive-brown placeholder:text-festive-brown/40 focus:border-festive-coral focus:ring-4 focus:ring-festive-coral/20"
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
              className="hand-drawn-card flex items-center gap-3 border-2 border-amber-400 bg-amber-50 px-4 py-3"
            >
              <Lightbulb className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                {validationResult.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          whileHover={answer.trim() !== '' && !isSubmitting ? { scale: 1.02, rotate: 1 } : undefined}
          whileTap={answer.trim() !== '' && !isSubmitting ? { scale: 0.98 } : undefined}
        >
          <Button
            onClick={handleSubmit}
            disabled={answer.trim() === '' || isSubmitting}
            className="hand-drawn w-full py-6 text-lg font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-festive-brown/30 disabled:text-festive-brown/60 shadow-md transition-all"
            size="lg"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </motion.div>
      </div>
    </PuzzleContainer>
  );
};
