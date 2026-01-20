'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, AlertTriangle } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ThresholdDecisionModalProps {
  pathId: PathId;
  currentScore: number;
  targetScore: number;
  remainingPuzzles: number;
  onDecision: (decision: 'claim' | 'perfect-run') => void;
  isTester?: boolean;
}

export const ThresholdDecisionModal = ({
  pathId,
  currentScore,
  targetScore,
  remainingPuzzles,
  onDecision,
  isTester = false,
}: ThresholdDecisionModalProps) => {
  const pathMeta = PATH_METADATA[pathId];

  // Fire confetti on mount
  useEffect(() => {
    const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  }, [pathMeta.colors]);

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className={`max-w-md border-4 shadow-2xl p-8 ${isTester ? 'bg-zinc-900 border-cyan-600' : 'bg-white'}`}>
        <DialogHeader className="space-y-4 flex flex-col items-center text-center">
          {/* Celebration Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                background: `linear-gradient(135deg, ${pathMeta.colors.primary}, ${pathMeta.colors.secondary})`,
              }}
            >
              <Trophy className="h-8 w-8 text-white" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Title */}
          <DialogTitle className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl text-center font-bold ${
                isTester ? 'text-cyan-400' : 'text-neutral-900'
              }`}
            >
              Congratulations!
            </motion.h2>
          </DialogTitle>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-center text-sm ${
              isTester ? 'text-zinc-300' : 'text-neutral-700'
            }`}
          >
            You've reached <span className="font-bold">91% mastery</span> on the{' '}
            <span className="font-semibold">{pathMeta.name}</span> path!
          </motion.p>
        </DialogHeader>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`mb-6 rounded-xl px-4 py-3 text-center ${
            isTester ? 'bg-zinc-800' : 'bg-neutral-100'
          }`}
        >
          <p className={`text-lg font-bold ${isTester ? 'text-cyan-400' : 'text-neutral-900'}`}>
            {currentScore} / {targetScore} PTS
          </p>
          <p className={`text-xs ${isTester ? 'text-zinc-400' : 'text-neutral-600'}`}>
            {remainingPuzzles} question{remainingPuzzles !== 1 ? 's' : ''} remaining
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mb-4 text-center text-sm font-semibold ${
            isTester ? 'text-zinc-400' : 'text-neutral-500'
          }`}
        >
          Choose your path:
        </motion.div>

        {/* Button Container with improved spacing */}
        <div className="space-y-4">
          {/* Option 1: Claim Key & Stop */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => onDecision('claim')}
            className={`duo-button w-full py-4 text-white ${
              isTester
                ? 'bg-cyan-600 hover:bg-cyan-500'
                : 'bg-duolingo-green hover:bg-duolingo-green-dark'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5" />
              <span className="font-bold">Claim Key & Stop</span>
            </div>
            <p className="mt-1 text-xs opacity-90">Keep your current progress</p>
          </motion.button>

          {/* Option 2: Go for 100% */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => onDecision('perfect-run')}
            className={`duo-button w-full py-4 ${isTester ? 'text-white' : 'text-neutral-900'}`}
            style={{
              background: `linear-gradient(135deg, ${pathMeta.colors.primary}20, ${pathMeta.colors.secondary}20)`,
              borderColor: pathMeta.colors.primary,
              borderWidth: '2px',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: pathMeta.colors.primary }} />
              <span className="font-bold">Go for 100% Mastery</span>
            </div>
            <p className="mt-1 text-xs opacity-75">
              Perfect Run: {remainingPuzzles} question{remainingPuzzles !== 1 ? 's' : ''}
            </p>
          </motion.button>
        </div>

        {/* Warning Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex items-start gap-2 rounded-lg bg-warning-orange/10 px-3 py-2"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-orange" />
          <p className={`text-xs ${isTester ? 'text-zinc-300' : 'text-neutral-700'}`}>
            <span className="font-bold">Perfect Run rule:</span> ONE wrong answer ends the
            attempt
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
