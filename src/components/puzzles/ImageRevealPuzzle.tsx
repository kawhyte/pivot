'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { ImageRevealPuzzle as ImageRevealPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { cn } from '@/lib/utils';
import type { PathId } from '@/lib/paths';

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
  isTester?: boolean;
  isBonusMode?: boolean;
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
  isTester = false,
  isBonusMode = false,
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
      show={puzzle.metadata?.show}
      isBonusMode={isBonusMode}
      shake={shake || closeShake}
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

     {/* Image with Clean Card Style - Fixed 500x300px */}
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{
    opacity: imageLoaded ? 1 : 0,
    scale: imageLoaded ? 1 : 0.95,
  }}
  transition={{
    duration: imageLoaded ? 0.6 : 0.4,
  }}
  /* Removed aspect-video and added fixed arbitrary dimensions */
  className="relative w-[500px] h-[300px] overflow-hidden mx-auto"
>
  <div className="relative w-full h-full duo-card bg-white p-2">
    <img
      src={puzzle.imageUrl}
      alt={puzzle.imageAlt}
      /* object-cover ensures the image fills the 500x300 space without distorting */
      className="absolute inset-0 w-full h-full object-contain rounded-xl"
      onLoad={() => setImageLoaded(true)}
    />
    {!imageLoaded && (
      <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-duolingo-green border-t-transparent" />
      </div>
    )}
  </div>
</motion.div>

        {/* Text Input - Clean Duolingo Style */}
        <div>
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type your answer..."
            disabled={isSubmitting}
            className={cn(
              "duo-input h-16 w-full text-2xl",
              isBonusMode && "bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-500"
            )}
          />
        </div>

        {/* Feedback Message for "Close" Status */}
        <AnimatePresence>
          {validationResult?.status === 'close' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="duo-card flex items-center gap-3 bg-blue-50 border-blue-200 px-4 py-3"
            >
              <Lightbulb className="h-6 w-6 flex-shrink-0 text-blue-600" />
              <p className="text-base font-semibold text-blue-800">
                {validationResult.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSubmit}
            disabled={answer.trim() === '' || isSubmitting}
            className={cn(
              "duo-button w-full py-4 text-xl font-bold text-white",
              isBonusMode
                ? 'bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600'
                : isTester
                ? 'bg-cyan-700 hover:bg-cyan-600 disabled:bg-neutral-300 disabled:text-neutral-500'
                : 'bg-duolingo-green hover:bg-duolingo-green-dark disabled:bg-neutral-300 disabled:text-neutral-500'
            )}
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </PuzzleContainer>
  );
};
