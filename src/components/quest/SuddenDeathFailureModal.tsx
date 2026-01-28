'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skull, Check, X, Minus, Lock, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SuddenDeathFailureModalProps {
  show: boolean;
  onComplete: () => void;
  bonusAttempt?: {
    questionsAttempted: number;  // 1, 2, or 3
    correctCount: number;         // How many they got right
    failedAt: number;             // Which question # they failed (1-3)
  };
  pathColor: string;              // From PATH_METADATA
}

export const SuddenDeathFailureModal = ({
  show,
  onComplete,
  bonusAttempt = { questionsAttempted: 1, correctCount: 0, failedAt: 1 },
  pathColor: _pathColor, // Reserved for future path-specific theming
}: SuddenDeathFailureModalProps) => {
  // Auto-dismiss after 4.5s
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  // Determine status for each of the 3 questions
  const getQuestionStatus = (questionNum: number) => {
    if (questionNum < bonusAttempt.failedAt) {
      return 'correct';
    } else if (questionNum === bonusAttempt.failedAt) {
      return 'failed';
    } else {
      return 'not-reached';
    }
  };

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="max-w-md border-4 border-red-500 shadow-2xl p-8 bg-gradient-to-br from-red-950 via-black to-black">
        <DialogHeader className="space-y-4 flex flex-col items-center text-center">
          {/* Stage 1: Dramatic Entry (0-0.5s) */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              delay: 0,
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className="flex justify-center pt-5"
          >
            <div className="relative">
              {/* Pulsing red glow */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-red-500 blur-xl"
              />
              <Skull className="relative h-20 w-20 text-red-500" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Title */}
          <DialogTitle className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-4xl mb-3 text-center font-black uppercase tracking-wide text-red-400"
              style={{
                textShadow: '0 0 20px rgba(248, 113, 113, 0.8)'
              }}
            >
              Sudden Death Failed
            </motion.h2>
          </DialogTitle>
        </DialogHeader>

        {/* Stage 2: Question Breakdown (0.5-2.5s) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6 space-y-3"
        >
          {[1, 2, 3].map((questionNum) => {
            const status = getQuestionStatus(questionNum);

            return (
              <motion.div
                key={questionNum}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (questionNum * 0.15) }}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 border-2 ${
                  status === 'correct'
                    ? 'bg-green-950/30 border-green-700/50'
                    : status === 'failed'
                    ? 'bg-red-950/50 border-red-600 animate-pulse'
                    : 'bg-gray-900/30 border-gray-700/30'
                }`}
              >
                {/* Icon */}
                {status === 'correct' && (
                  <Check className="h-6 w-6 text-green-400 flex-shrink-0" strokeWidth={3} />
                )}
                {status === 'failed' && (
                  <X className="h-6 w-6 text-red-400 flex-shrink-0" strokeWidth={3} />
                )}
                {status === 'not-reached' && (
                  <Minus className="h-6 w-6 text-gray-500 flex-shrink-0" strokeWidth={2} />
                )}

                {/* Text */}
                <div className="flex-1">
                  <p className={`text-sm font-bold ${
                    status === 'correct'
                      ? 'text-green-300'
                      : status === 'failed'
                      ? 'text-red-300'
                      : 'text-gray-500'
                  }`}>
                    Question {questionNum}
                  </p>
                </div>

                {/* Status Label */}
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  status === 'correct'
                    ? 'text-green-400'
                    : status === 'failed'
                    ? 'text-red-400'
                    : 'text-gray-600'
                }`}>
                  {status === 'correct' ? 'Correct' : status === 'failed' ? 'Missed' : 'Not Reached'}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stage 3: Encouraging Message (2.5-4s) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="space-y-4 text-center"
        >
          {/* "Almost Legendary" */}
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-yellow-400" strokeWidth={2.5} />
            <p className="text-2xl font-black text-yellow-300 uppercase tracking-wide">
              Almost Legendary!
            </p>
            <Zap className="h-6 w-6 text-yellow-400" strokeWidth={2.5} />
          </div>

          {/* Needed all 3 */}
          <p className="text-base font-semibold text-red-200">
            Needed all 3 correct in a row - so close!
          </p>

          {/* Base Gift Locked In */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3 }}
            className="mt-4 rounded-lg bg-green-950/40 border-2 border-green-600/50 px-4 py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-green-400" strokeWidth={2.5} />
              <p className="text-base font-black text-green-300 uppercase tracking-wide">
                Your Base Gift is LOCKED IN
              </p>
              <Lock className="h-5 w-5 text-green-400" strokeWidth={2.5} />
            </div>
            <p className="mt-1 text-xs font-semibold text-green-200/80">
              Nothing lost - check your stats!
            </p>
          </motion.div>
        </motion.div>

        {/* Stage 4: Exit happens automatically via useEffect timeout */}
      </DialogContent>
    </Dialog>
  );
};
