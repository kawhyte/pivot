'use client';

import { useState, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { TextInputPuzzle as TextInputPuzzleType, ValidationResult } from '@/types/puzzle';
import { PuzzleContainer } from './PuzzleContainer';
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
    >
      <div className="space-y-4">
        {/* Text Input - Clean Duolingo Style */}
        <div>
          <input
            type="text"
            value={answer}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={puzzle.placeholder || 'Type your answer...'}
            disabled={isSubmitting}
            className="duo-input h-16 w-full text-base"
            autoFocus
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
              <Lightbulb className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <p className="text-sm font-semibold text-blue-800">
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
            className={`duo-button w-full py-4 text-lg font-bold text-white ${
              isTester
                ? 'bg-cyan-700 hover:bg-cyan-600 disabled:bg-neutral-300 disabled:text-neutral-500'
                : 'bg-duolingo-green hover:bg-duolingo-green-dark disabled:bg-neutral-300 disabled:text-neutral-500'
            }`}
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </button>
        </div>
      </div>
    </PuzzleContainer>
  );
};
