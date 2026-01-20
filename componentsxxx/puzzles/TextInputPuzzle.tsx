'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { TextInputPuzzle as TextInputPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; //
import type { PathId } from '@/store/useQuestStore';

interface TextInputPuzzleProps {
  puzzle: TextInputPuzzleType;
  onSubmit: (answer: string) => void;
  showHint: boolean;
  isSubmitting: boolean;
  validationResult?: ValidationResult | null;
  pathId: PathId;
  currentMistakes: number;
  elapsedTime: number;
  currentScore: number;
  targetScore: number;
  isBonusMode?: boolean; // Add this prop
}

export const TextInputPuzzle = ({
  puzzle,
  onSubmit,
  showHint,
  isSubmitting,
  validationResult,
  pathId,
  currentMistakes,
  elapsedTime,
  currentScore,
  targetScore,
  isBonusMode = false, // Default to false
}: TextInputPuzzleProps) => {
  const [answer, setAnswer] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (answer.trim() === '' || isSubmitting) return;

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
      difficulty={puzzle.difficulty}
      pathId={pathId}
      currentMistakes={currentMistakes}
      elapsedTime={elapsedTime}
      currentScore={currentScore}
      targetScore={targetScore}
      isBonusMode={isBonusMode} // Pass down to container
    >
      <div className="space-y-4">
        <motion.div
          animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Input
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={puzzle.placeholder || 'Type your answer...'}
            disabled={isSubmitting}
            className={cn(
              "hand-drawn h-14 border-3 px-6 text-lg transition-all",
              // Switch input colors based on mode
              isBonusMode
                ? "border-red-600 bg-zinc-950/50 text-white placeholder:text-zinc-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20"
                : "border-festive-brown/20 bg-white text-festive-brown placeholder:text-festive-brown/40 focus:border-festive-coral focus:ring-4 focus:ring-festive-coral/20"
            )}
            autoFocus
          />
        </motion.div>

        <AnimatePresence>
          {validationResult?.status === 'close' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "hand-drawn-card flex items-center gap-3 border-2 px-4 py-3",
                // Update feedback card for dark background
                isBonusMode
                  ? "border-red-500/50 bg-red-950/40 text-red-200"
                  : "border-amber-400 bg-amber-50 text-amber-800"
              )}
            >
              <Lightbulb className={cn("h-5 w-5 flex-shrink-0", isBonusMode ? "text-red-400" : "text-amber-600")} />
              <p className="text-sm font-medium">
                {validationResult.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={answer.trim() !== '' && !isSubmitting ? { scale: 1.02, rotate: 1 } : undefined}
          whileTap={answer.trim() !== '' && !isSubmitting ? { scale: 0.98 } : undefined}
        >
          <Button
            onClick={handleSubmit}
            disabled={answer.trim() === '' || isSubmitting}
            className={cn(
              "hand-drawn w-full py-6 text-lg font-semibold text-white shadow-md transition-all",
              // Themed Submit Button
              isBonusMode
                ? "bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500"
                : "bg-festive-coral hover:bg-festive-coral/90 disabled:bg-festive-brown/30 disabled:text-festive-brown/60"
            )}
            size="lg"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </motion.div>
      </div>
    </PuzzleContainer>
  );
};