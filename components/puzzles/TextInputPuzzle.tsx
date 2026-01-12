'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { TextInputPuzzle as TextInputPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
}: TextInputPuzzleProps) => {
  const [answer, setAnswer] = useState('');
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
      difficulty={puzzle.difficulty}
      pathId={pathId}
      currentMistakes={currentMistakes}
      elapsedTime={elapsedTime}
    >
      <div className="space-y-4">
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
            placeholder={puzzle.placeholder || 'Type your answer...'}
            disabled={isSubmitting}
            className="hand-drawn h-14 border-3 border-festive-brown/20 bg-white px-6 text-base text-festive-brown placeholder:text-festive-brown/40 focus:border-festive-coral focus:ring-4 focus:ring-festive-coral/20"
            autoFocus
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
            className="hand-drawn w-full py-6 text-lg font-semibold text-white bg-festive-coral hover:bg-festive-coral/90 disabled:bg-festive-brown/30 disabled:text-festive-brown/60 shadow-md transition-all"
            size="lg"
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </Button>
        </motion.div>
      </div>
    </PuzzleContainer>
  );
};
