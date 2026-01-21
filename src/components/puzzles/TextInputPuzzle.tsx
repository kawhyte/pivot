'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ArrowLeft } from 'lucide-react';
import type { TextInputPuzzle as TextInputPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { cn } from '@/lib/utils';
import type { PathId } from '@/lib/paths';

interface TextInputPuzzleProps {
  puzzle: TextInputPuzzleType;
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

export const TextInputPuzzle = ({
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
}: TextInputPuzzleProps) => {
  const [answer, setAnswer] = useState('');
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
      <div className="space-y-8">
        {/* Text Input - Notepad Line Style */}
        <div className="relative">
          <input
            key={puzzle.id}
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={puzzle.placeholder || 'Type your answer...'}
            disabled={isSubmitting}
            className={cn(
              "duo-input font-doodle text-3xl w-full",
              isBonusMode && "bg-zinc-900/50 border-red-500/30 text-white placeholder:text-zinc-500"
            )}
            autoFocus
          />
          <ArrowLeft className={cn(
            "absolute bottom-0 right-0 h-5 w-5 rotate-180",
            isBonusMode ? "text-red-500/50" : "text-neutral-300"
          )} />
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
